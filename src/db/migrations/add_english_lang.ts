import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

async function migrate() {
  try {
    console.log('🔄 Добавление полей для английского языка...');

    // ----- categories -----
    await sql`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS "nameEn" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT
    `.execute(db);

    // Заполняем nameEn из nameRu, иначе из старой колонки name (если она ещё есть)
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'categories' AND column_name = 'nameRu'
        ) THEN
          UPDATE categories
          SET "nameEn" = COALESCE("nameEn", "nameRu")
          WHERE "nameEn" IS NULL;
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'categories' AND column_name = 'name'
        ) THEN
          UPDATE categories
          SET "nameEn" = COALESCE("nameEn", "name")
          WHERE "nameEn" IS NULL;
        END IF;
      END $$;
    `.execute(db);

    // descriptionEn — аналогично
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'categories' AND column_name = 'descriptionRu'
        ) THEN
          UPDATE categories
          SET "descriptionEn" = COALESCE("descriptionEn", "descriptionRu")
          WHERE "descriptionEn" IS NULL;
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'categories' AND column_name = 'description'
        ) THEN
          UPDATE categories
          SET "descriptionEn" = COALESCE("descriptionEn", "description")
          WHERE "descriptionEn" IS NULL;
        END IF;
      END $$;
    `.execute(db);

    // Если после копирования всё ещё остались NULL — заполним пустой строкой,
    // чтобы можно было выставить NOT NULL.
    await sql`
      UPDATE categories SET "nameEn" = '' WHERE "nameEn" IS NULL
    `.execute(db);

    await sql`
      ALTER TABLE categories
      ALTER COLUMN "nameEn" SET NOT NULL
    `.execute(db);

    console.log('✅ Поля для категорий обновлены');

    // ----- news -----
    await sql`
      ALTER TABLE news
      ADD COLUMN IF NOT EXISTS "titleEn" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "contentEn" TEXT
    `.execute(db);

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'news' AND column_name = 'titleRu'
        ) THEN
          UPDATE news
          SET "titleEn" = COALESCE("titleEn", "titleRu")
          WHERE "titleEn" IS NULL;
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'news' AND column_name = 'title'
        ) THEN
          UPDATE news
          SET "titleEn" = COALESCE("titleEn", "title")
          WHERE "titleEn" IS NULL;
        END IF;
      END $$;
    `.execute(db);

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'news' AND column_name = 'contentRu'
        ) THEN
          UPDATE news
          SET "contentEn" = COALESCE("contentEn", "contentRu")
          WHERE "contentEn" IS NULL;
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'news' AND column_name = 'content'
        ) THEN
          UPDATE news
          SET "contentEn" = COALESCE("contentEn", "content")
          WHERE "contentEn" IS NULL;
        END IF;
      END $$;
    `.execute(db);

    // Подстраховываемся, если в news вдруг не было ни RU ни старого title/content
    await sql`UPDATE news SET "titleEn" = '' WHERE "titleEn" IS NULL`.execute(db);
    await sql`UPDATE news SET "contentEn" = '' WHERE "contentEn" IS NULL`.execute(db);

    await sql`
      ALTER TABLE news
      ALTER COLUMN "titleEn" SET NOT NULL,
      ALTER COLUMN "contentEn" SET NOT NULL
    `.execute(db);

    console.log('✅ Поля для новостей обновлены');

    console.log('🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

migrate();
