import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

async function migrate() {
  try {
    console.log('🔄 Добавление полей для мультиязычности и изображений...');

    // Обновляем таблицу categories
    await sql`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS "nameRu" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "nameTm" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "descriptionRu" TEXT,
      ADD COLUMN IF NOT EXISTS "descriptionTm" TEXT
    `.execute(db);

    // Если старые поля name и description существуют, копируем данные в новые поля
    await sql`
      UPDATE categories
      SET "nameRu" = COALESCE("nameRu", name),
          "nameTm" = COALESCE("nameTm", name),
          "descriptionRu" = COALESCE("descriptionRu", description),
          "descriptionTm" = COALESCE("descriptionTm", description)
      WHERE "nameRu" IS NULL OR "nameTm" IS NULL
    `.execute(db);

    // Делаем новые поля обязательными
    await sql`
      ALTER TABLE categories
      ALTER COLUMN "nameRu" SET NOT NULL,
      ALTER COLUMN "nameTm" SET NOT NULL
    `.execute(db);

    console.log('✅ Поля для категорий обновлены');

    // Обновляем таблицу news
    await sql`
      ALTER TABLE news
      ADD COLUMN IF NOT EXISTS "titleRu" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "titleTm" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "contentRu" TEXT,
      ADD COLUMN IF NOT EXISTS "contentTm" TEXT,
      ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "isFlash" BOOLEAN DEFAULT false
    `.execute(db);

    // Если старые поля title и content существуют, копируем данные в новые поля
    await sql`
      UPDATE news
      SET "titleRu" = COALESCE("titleRu", title),
          "titleTm" = COALESCE("titleTm", title),
          "contentRu" = COALESCE("contentRu", content),
          "contentTm" = COALESCE("contentTm", content)
      WHERE "titleRu" IS NULL OR "titleTm" IS NULL
    `.execute(db);

    // Делаем новые поля обязательными
    await sql`
      ALTER TABLE news
      ALTER COLUMN "titleRu" SET NOT NULL,
      ALTER COLUMN "titleTm" SET NOT NULL,
      ALTER COLUMN "contentRu" SET NOT NULL,
      ALTER COLUMN "contentTm" SET NOT NULL
    `.execute(db);

    console.log('✅ Поля для новостей обновлены');

    // Удаляем старые поля (опционально, можно закомментировать если нужно сохранить)
    // await sql`
    //   ALTER TABLE categories
    //   DROP COLUMN IF EXISTS name,
    //   DROP COLUMN IF EXISTS description
    // `.execute(db);

    // await sql`
    //   ALTER TABLE news
    //   DROP COLUMN IF EXISTS title,
    //   DROP COLUMN IF EXISTS content
    // `.execute(db);

    console.log('🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    throw error;
  } finally {
    await db.destroy(); // Закрываем соединение
  }
}

migrate();
