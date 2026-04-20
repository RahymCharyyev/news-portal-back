import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

async function migrate() {
  try {
    console.log('🔄 Добавление роли пользователей...');

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'user'
    `.execute(db);

    await sql`
      UPDATE users
      SET role = CASE
        WHEN lower(email) LIKE '%admin%' THEN 'admin'
        ELSE COALESCE(role, 'user')
      END
      WHERE role IS NULL OR role NOT IN ('admin', 'user')
    `.execute(db);

    console.log('✅ Поле role добавлено в users');
  } catch (error) {
    console.error('❌ Ошибка миграции role:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

migrate();
