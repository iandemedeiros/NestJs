import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createDatabaseFixture } from './database-fixture.js';

describe.each([
  ['alunos', 'curso'],
  ['professores', 'disciplina'],
])('%s (e2e)', (recurso, campo) => {
  let app: INestApplication<App>;
  let fixture: Awaited<ReturnType<typeof createDatabaseFixture>>;

  beforeEach(async () => {
    fixture = await createDatabaseFixture();
    app = await fixture.createApp();
  });

  afterEach(async () => {
    await app?.close();
    await fixture?.cleanup();
  });

  it('lista, busca, cria, atualiza e exclui sem repetir IDs', async () => {
    const server = app.getHttpServer();
    const rota = `/${recurso}`;
    const inicial = await request(server).get(rota).expect(200);
    expect(inicial.body).toHaveLength(2);
    await request(server).get(`${rota}/1`).expect(200).expect(inicial.body[0]);

    const email = recurso === 'alunos' ? { email: 'maria@example.com' } : {};
    const dados = { nome: 'Maria', [campo]: 'Software', ...email };
    await request(server)
      .post(rota)
      .send(dados)
      .expect(201)
      .expect({ id: 3, ...dados });
    const novoEmail =
      recurso === 'alunos' ? { email: 'maria.silva@example.com' } : {};
    const alterado = {
      nome: 'Maria Silva',
      [campo]: 'Programação',
      ...novoEmail,
    };
    await request(server)
      .put(`${rota}/3`)
      .send(alterado)
      .expect(200)
      .expect({ id: 3, ...alterado });
    await request(server)
      .get(`${rota}/3`)
      .expect(200)
      .expect({ id: 3, ...alterado });
    await request(server)
      .delete(`${rota}/1`)
      .expect(recurso === 'alunos' ? 204 : 200)
      .expect(recurso === 'alunos' ? '' : 'true');
    await request(server)
      .delete(`${rota}/1`)
      .expect(recurso === 'alunos' ? 404 : 200);
    await request(server)
      .post(rota)
      .send(dados)
      .expect(201)
      .expect({ id: 4, ...dados });
    const final = await request(server).get(rota).expect(200);
    expect(final.body.map((item: { id: number }) => item.id)).toEqual([
      2, 3, 4,
    ]);
  });

  it('rejeita IDs que não são inteiros', async () => {
    const server = app.getHttpServer();
    await request(server).get(`/${recurso}/abc`).expect(400);
    await request(server).put(`/${recurso}/abc`).send({}).expect(400);
    await request(server).delete(`/${recurso}/abc`).expect(400);
  });

  if (recurso === 'alunos') {
    it('preserva email e dados ao reiniciar a aplicação e parametriza textos', async () => {
      const dados = {
        nome: "Maria'); DROP TABLE alunos; --",
        email: 'teste@example.com',
        curso: 'Programação',
      };
      const criado = await request(app.getHttpServer())
        .post('/alunos')
        .send(dados)
        .expect(201);
      await app.close();
      app = await fixture.createApp();
      await request(app.getHttpServer())
        .get(`/alunos/${criado.body.id}`)
        .expect(200)
        .expect({ id: criado.body.id, ...dados });
      const lista = await request(app.getHttpServer())
        .get('/alunos')
        .expect(200);
      expect(lista.body).toHaveLength(3);
      await request(app.getHttpServer()).get('/alunos/99999').expect(404);
    });
  }
});
