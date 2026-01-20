import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '../db/schema';

// Парсим DATABASE_URL или используем отдельные переменные
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'news_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Создаем экземпляр Kysely с нашими типами
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});