import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

async function migrate() {
  try {
    console.log('🔄 Добавление колонки isBlocked в users...');

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false
    `.execute(db);

    console.log('🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

migrate();
