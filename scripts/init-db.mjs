import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createConnection, escapeId } from 'mysql2/promise';
if (existsSync('.env')) process.loadEnvFile('.env');
for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
  if (process.env[key] === undefined)
    throw new Error(`Configure ${key} no .env`);
}

const connection = await createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  charset: 'utf8mb4',
});

try {
  const database = escapeId(process.env.DB_NAME);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4`,
  );
  await connection.query(`USE ${database}`);
  await connection.query(
    await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'),
  );
  // Atualiza também tabelas existentes sem apagar registros.
  const [columns] = await connection.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'email'",
    [process.env.DB_NAME],
  );
  if (columns.length === 0) {
    await connection.query('ALTER TABLE alunos ADD COLUMN email VARCHAR(150)');
  }
  const [missingEmails] = await connection.query(
    'SELECT COUNT(*) AS total FROM alunos WHERE email IS NULL',
  );
  if (missingEmails[0].total > 0) {
    throw new Error(
      'Existem alunos sem email. Preencha os emails desses registros e execute db:init novamente; nenhum registro foi apagado.',
    );
  }
  await connection.query(
    'ALTER TABLE alunos MODIFY COLUMN email VARCHAR(150) NOT NULL',
  );
  await connection.query(
    await readFile(new URL('../database/seed.sql', import.meta.url), 'utf8'),
  );
  console.log(
    'Banco preparado: alunos com email obrigatório, disciplinas e dados iniciais.',
  );
} finally {
  await connection.end();
}
