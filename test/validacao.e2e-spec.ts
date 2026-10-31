import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createDatabaseFixture } from './database-fixture.js';

describe('Aula 3: validação e erros HTTP (MySQL)', () => {
  let app: INestApplication<App>;
  let fixture: Awaited<ReturnType<typeof createDatabaseFixture>>;
  const aluno = { nome: 'João', email: 'joao@example.com', curso: 'ADS' };

  beforeEach(async () => {
    fixture = await createDatabaseFixture();
    app = await fixture.createApp();
  });

  afterEach(async () => {
    await app?.close();
    await fixture?.cleanup();
  });

  it('rejeita dados inválidos e campos obrigatórios ausentes em POST e PUT', async () => {
    const invalidos = [
      {},
      { ...aluno, nome: '' },
      { ...aluno, nome: 123 },
      { ...aluno, nome: 'a'.repeat(101) },
      { ...aluno, curso: '' },
      { ...aluno, curso: false },
      { ...aluno, curso: 'a'.repeat(101) },
      { nome: aluno.nome, email: aluno.email },
      { nome: aluno.nome, curso: aluno.curso },
      { ...aluno, email: 'abc' },
      { ...aluno, email: null },
      { ...aluno, email: `${'a'.repeat(140)}@example.com` },
    ];
    for (const body of invalidos) {
      const response = await request(app.getHttpServer())
        .post('/alunos')
        .send(body)
        .expect(400);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message.length).toBeGreaterThan(0);
      await request(app.getHttpServer())
        .put('/alunos/1')
        .send(body)
        .expect(400);
    }
    const lista = await request(app.getHttpServer()).get('/alunos').expect(200);
    expect(lista.body).toHaveLength(2);
    expect(lista.body[0].nome).toBe('Ana');
  });

  it('remove campos extras e transforma o corpo em DTO antes do controller', async () => {
    const criado = await request(app.getHttpServer())
      .post('/alunos')
      .send({ ...aluno, admin: true, id: 999 })
      .expect(201);
    expect(criado.body).toEqual({ id: 3, ...aluno });
    await request(app.getHttpServer())
      .put('/alunos/3')
      .send({ ...aluno, nome: 'João Silva', admin: true })
      .expect(200)
      .expect({ id: 3, ...aluno, nome: 'João Silva' });
  });

  it('retorna 404 para consulta, PUT, PATCH e DELETE de aluno inexistente', async () => {
    const server = app.getHttpServer();
    const response = await request(server).get('/alunos/99999').expect(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Aluno não encontrado',
    });
    await request(server).put('/alunos/99999').send(aluno).expect(404);
    await request(server)
      .patch('/alunos/99999')
      .send({ curso: 'SI' })
      .expect(404);
    await request(server).delete('/alunos/99999').expect(404);
  });

  it('atualiza parcialmente sem perder campos e aceita repetir os mesmos valores', async () => {
    const server = app.getHttpServer();
    const original = await request(server).get('/alunos/1').expect(200);
    await request(server)
      .patch('/alunos/1')
      .send({ curso: 'Engenharia de Software', admin: true })
      .expect(200)
      .expect({ ...original.body, curso: 'Engenharia de Software' });
    const atualizado = { ...original.body, curso: 'Engenharia de Software' };
    await request(server)
      .patch('/alunos/1')
      .send({})
      .expect(200)
      .expect(atualizado);
    await request(server)
      .patch('/alunos/1')
      .send({ curso: atualizado.curso })
      .expect(200)
      .expect(atualizado);
    await request(server)
      .put('/alunos/1')
      .send(atualizado)
      .expect(200)
      .expect(atualizado);
    await request(server)
      .patch('/alunos/1')
      .send({ email: aluno.email, nome: aluno.nome })
      .expect(200)
      .expect({ ...atualizado, email: aluno.email, nome: aluno.nome });
  });

  it('aplica as mesmas regras aos campos enviados no PATCH, incluindo null', async () => {
    const server = app.getHttpServer();
    for (const body of [
      { email: 'abc' },
      { email: null },
      { nome: '' },
      { nome: null },
      { curso: 123 },
      { curso: null },
    ]) {
      await request(server).patch('/alunos/1').send(body).expect(400);
    }
    await request(server)
      .patch('/alunos/abc')
      .send({ curso: 'SI' })
      .expect(400);
  });

  it('exclui com 204 sem corpo e retorna 404 nas operações seguintes', async () => {
    const server = app.getHttpServer();
    const response = await request(server).delete('/alunos/1').expect(204);
    expect(response.text).toBe('');
    await request(server).get('/alunos/1').expect(404);
    await request(server).delete('/alunos/1').expect(404);
  });

  it('executa o CRUD de disciplinas com SQL e códigos HTTP adequados', async () => {
    const server = app.getHttpServer();
    const dados = { nome: 'Programação', carga_horaria: 80 };
    await request(server).get('/disciplinas').expect(200).expect([]);
    await request(server)
      .post('/disciplinas')
      .send({ ...dados, admin: true })
      .expect(201)
      .expect({ id: 1, ...dados });
    await request(server)
      .get('/disciplinas/1')
      .expect(200)
      .expect({ id: 1, ...dados });
    const atualizado = { nome: 'Banco de Dados', carga_horaria: 60 };
    await request(server)
      .put('/disciplinas/1')
      .send(atualizado)
      .expect(200)
      .expect({ id: 1, ...atualizado });
    await request(server)
      .put('/disciplinas/1')
      .send(atualizado)
      .expect(200)
      .expect({ id: 1, ...atualizado });
    await app.close();
    app = await fixture.createApp();
    await request(app.getHttpServer())
      .get('/disciplinas')
      .expect(200)
      .expect([{ id: 1, ...atualizado }]);
    await request(app.getHttpServer())
      .delete('/disciplinas/1')
      .expect(204)
      .expect('');
    await request(app.getHttpServer()).get('/disciplinas/1').expect(404);
    await request(app.getHttpServer())
      .put('/disciplinas/1')
      .send(atualizado)
      .expect(404);
    await request(app.getHttpServer()).delete('/disciplinas/1').expect(404);
  });

  it('valida nome e carga horária de disciplinas e rejeita IDs inválidos', async () => {
    const server = app.getHttpServer();
    const dados = { nome: 'Programação', carga_horaria: 80 };
    const invalidos = [
      {},
      { nome: 'SI' },
      { carga_horaria: 80 },
      { ...dados, nome: '' },
      { ...dados, nome: 123 },
      { ...dados, nome: 'a'.repeat(101) },
      ...[0, -1, 1.5, '80', null, 2147483648].map((carga_horaria) => ({
        ...dados,
        carga_horaria,
      })),
    ];
    for (const body of invalidos) {
      await request(server).post('/disciplinas').send(body).expect(400);
      await request(server).put('/disciplinas/1').send(body).expect(400);
    }
    await request(server).get('/disciplinas/abc').expect(400);
    await request(server).put('/disciplinas/abc').send(dados).expect(400);
    await request(server).delete('/disciplinas/abc').expect(400);
    await request(server).get('/disciplinas').expect(200).expect([]);
  });
});
