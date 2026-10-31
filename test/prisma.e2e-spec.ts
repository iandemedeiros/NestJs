import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createDatabaseFixture } from './database-fixture.js';

describe('Aula 4: Prisma, filtros, paginação e relações', () => {
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

  it('combina filtro de curso, pesquisa parcial e páginas ordenadas por ID', async () => {
    const server = app.getHttpServer();
    const alunos = [
      { nome: 'Ana Maria', email: 'ana.maria@example.com', curso: 'ADS' },
      { nome: 'Mariana', email: 'mariana@example.com', curso: 'ADS' },
      { nome: 'Roberto', email: 'roberto@example.com', curso: 'ADS' },
    ];
    for (const aluno of alunos) {
      await request(server).post('/alunos').send(aluno).expect(201);
    }
    const filtered = await request(server)
      .get('/alunos')
      .query({ curso: 'ADS' })
      .expect(200);
    expect(filtered.body.map((aluno: { nome: string }) => aluno.nome)).toEqual(
      alunos.map((aluno) => aluno.nome),
    );
    const search = await request(server)
      .get('/alunos')
      .query({ nome: 'ana', curso: 'ADS', page: 2, limit: 1 })
      .expect(200);
    expect(search.body).toEqual([{ id: 4, ...alunos[1] }]);
    await request(server)
      .get('/alunos')
      .query({ page: 2, limit: 2 })
      .expect(200)
      .expect([
        { id: 3, ...alunos[0] },
        { id: 4, ...alunos[1] },
      ]);
    await request(server)
      .get('/alunos')
      .query({ curso: 'Inexistente' })
      .expect(200)
      .expect([]);
    await request(server)
      .get('/alunos')
      .query({ page: 100, limit: 10 })
      .expect(200)
      .expect([]);
    await request(server)
      .get('/alunos')
      .query({ nome: "'; DROP TABLE alunos; --" })
      .expect(200)
      .expect([]);
    const intact = await request(server).get('/alunos').expect(200);
    expect(intact.body).toHaveLength(5);
  });

  it('rejeita paginação e filtros inválidos com HTTP 400', async () => {
    for (const query of [
      { page: 'abc' },
      { page: '0' },
      { page: '-1' },
      { page: '1.5' },
      { page: '1000001' },
      { limit: '0' },
      { limit: '101' },
      { limit: 'abc' },
      { nome: 'a'.repeat(101) },
      { curso: ['ADS', 'SI'] },
    ]) {
      await request(app.getHttpServer())
        .get('/alunos')
        .query(query)
        .expect(400);
    }
  });

  it('retorna 409 para email duplicado em POST, PUT e PATCH sem alterar registros', async () => {
    const server = app.getHttpServer();
    const dados = { nome: 'Outra Ana', email: 'ana@example.com', curso: 'ADS' };
    const response = await request(server)
      .post('/alunos')
      .send(dados)
      .expect(409);
    expect(response.body).toMatchObject({ statusCode: 409, error: 'Conflict' });
    expect(response.text).not.toContain('PrismaClient');
    await request(server).put('/alunos/2').send(dados).expect(409);
    await request(server)
      .patch('/alunos/2')
      .send({ email: dados.email })
      .expect(409);
    const carlos = await request(server).get('/alunos/2').expect(200);
    expect(carlos.body.nome).toBe('Carlos');
    expect(carlos.body.email).toBe('carlos@example.com');
  });

  it('relaciona vários alunos ao mesmo curso e atualiza a relação no PATCH', async () => {
    const server = app.getHttpServer();
    for (const id of [1, 2]) {
      await request(server)
        .patch(`/alunos/${id}`)
        .send({ curso: 'ADS' })
        .expect(200);
    }
    const courses = await request(server).get('/cursos').expect(200);
    const ads = courses.body.filter(
      (curso: { nome: string }) => curso.nome === 'ADS',
    );
    expect(ads).toHaveLength(1);
    expect(ads[0].alunos.map((aluno: { id: number }) => aluno.id)).toEqual([
      1, 2,
    ]);
    await request(server)
      .patch('/alunos/1')
      .send({ curso: 'Engenharia de Software' })
      .expect(200);
    const updated = await request(server).get('/cursos').expect(200);
    expect(
      updated.body
        .find((curso: { nome: string }) => curso.nome === 'ADS')
        .alunos.map((aluno: { id: number }) => aluno.id),
    ).toEqual([2]);
    expect(
      updated.body.find(
        (curso: { nome: string }) => curso.nome === 'Engenharia de Software',
      ).alunos[0].id,
    ).toBe(1);
  });
});
