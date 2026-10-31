import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe.each([
  ['alunos', 'curso'],
  ['professores', 'disciplina'],
])('%s (e2e)', (recurso, campo) => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lista, busca, cria, atualiza e exclui sem repetir IDs', async () => {
    const server = app.getHttpServer();
    const rota = `/${recurso}`;
    const inicial = await request(server).get(rota).expect(200);
    expect(inicial.body).toHaveLength(2);
    await request(server).get(`${rota}/1`).expect(200).expect(inicial.body[0]);

    const dados = { nome: 'Maria', [campo]: 'Software' };
    await request(server)
      .post(rota)
      .send(dados)
      .expect(201)
      .expect({ id: 3, ...dados });
    const alterado = { nome: 'Maria Silva', [campo]: 'Programação' };
    await request(server)
      .put(`${rota}/3`)
      .send(alterado)
      .expect(200)
      .expect({ id: 3, ...alterado });
    await request(server)
      .get(`${rota}/3`)
      .expect(200)
      .expect({ id: 3, ...alterado });
    await request(server).delete(`${rota}/1`).expect(200).expect('true');
    await request(server).delete(`${rota}/1`).expect(200).expect('false');
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
});
