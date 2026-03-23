import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

/**
 * Удаляет старые колонки title, content из news и name, description из categories.
 * Запускайте после add_multilang_and_image.ts, если в БД остались старые колонки.
 */
async function migrate() {
  try {
    console.log('🔄 Удаление старых колонок...');

    await sql`ALTER TABLE categories DROP COLUMN IF EXISTS name`.execute(db);
    await sql`ALTER TABLE categories DROP COLUMN IF EXISTS description`.execute(db);
    await sql`ALTER TABLE news DROP COLUMN IF EXISTS title`.execute(db);
    await sql`ALTER TABLE news DROP COLUMN IF EXISTS content`.execute(db);

    console.log('🎉 Старые колонки удалены.');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

migrate();
