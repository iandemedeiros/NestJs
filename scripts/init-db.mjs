import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import mariadb from 'mariadb';
if (existsSync('.env')) process.loadEnvFile('.env');
for (const key of [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DATABASE_URL',
]) {
  if (process.env[key] === undefined)
    throw new Error(`Configure ${key} no .env`);
}
const url = new URL(process.env.DATABASE_URL);
if (
  decodeURIComponent(url.pathname.slice(1)) !== process.env.DB_NAME ||
  url.hostname !== process.env.DB_HOST ||
  Number(url.port || 3306) !== Number(process.env.DB_PORT) ||
  decodeURIComponent(url.username) !== process.env.DB_USER ||
  decodeURIComponent(url.password) !== process.env.DB_PASSWORD
) {
  throw new Error(
    'DATABASE_URL e DB_* devem apontar para o mesmo banco e credenciais.',
  );
}
const connection = await mariadb.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${connection.escapeId(process.env.DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  );
} finally {
  await connection.end();
}
for (const args of [
  ['migrate', 'deploy'],
  ['db', 'seed'],
]) {
  const result = spawnSync(
    process.execPath,
    ['node_modules/prisma/build/index.js', ...args],
    { stdio: 'inherit', env: process.env },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
