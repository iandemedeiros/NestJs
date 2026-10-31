import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import mariadb from 'mariadb';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { seedData } from '../prisma/seed-data.js';

// Migrations reais em bases descartáveis; nunca altera a base escola.
export async function createDatabaseFixture() {
  const databaseName = `api_alunos_test_${randomUUID().replaceAll('-', '')}`;
  const options = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
  const connection = await mariadb.createConnection(options);
  const database = connection.escapeId(databaseName);
  try {
    await connection.query(
      `CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
    );
    const url = new URL(process.env.DATABASE_URL!);
    url.pathname = '/' + databaseName;
    execFileSync(
      process.execPath,
      ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
      {
        env: { ...process.env, DATABASE_URL: url.toString() },
        stdio: 'pipe',
      },
    );
    const seedClient = new PrismaService(
      new ConfigService({ ...process.env, DB_NAME: databaseName }),
    );
    try {
      await seedData(seedClient);
    } finally {
      await seedClient.$disconnect();
    }
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
      const connection = await mariadb.createConnection(options);
      try {
        await connection.query(`DROP DATABASE ${database}`);
      } finally {
        await connection.end();
      }
    },
  };
}
