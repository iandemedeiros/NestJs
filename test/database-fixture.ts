import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { createConnection, escapeId } from 'mysql2/promise';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';

// Cada teste usa um banco novo; nunca limpa a base escola.
export async function createDatabaseFixture() {
  const databaseName = `api_alunos_test_${randomUUID().replaceAll('-', '')}`;
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  const database = escapeId(databaseName);
  try {
    await connection.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4`);
    await connection.query(`USE ${database}`);
    await connection.query(
      await readFile(
        new URL('../database/schema.sql', import.meta.url),
        'utf8',
      ),
    );
    await connection.query(
      await readFile(new URL('../database/seed.sql', import.meta.url), 'utf8'),
    );
  } catch (error) {
    await connection.query(`DROP DATABASE IF EXISTS ${database}`);
    throw error;
  } finally {
    await connection.end();
  }

  return {
    async createApp() {
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(ConfigService)
        .useValue(new ConfigService({ ...process.env, DB_NAME: databaseName }))
        .compile();
      const app = module.createNestApplication();
      configureApp(app);
      await app.init();
      return app;
    },
    async cleanup() {
      const connection = await createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      try {
        await connection.query(`DROP DATABASE ${database}`);
      } finally {
        await connection.end();
      }
    },
  };
}
