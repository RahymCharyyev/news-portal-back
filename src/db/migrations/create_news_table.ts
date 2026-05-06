import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

export async function createNewsTable() {
  await db.schema
    .createTable('news')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('titleRu', 'varchar(500)', (col) => col.notNull())
    .addColumn('titleTm', 'varchar(500)', (col) => col.notNull())
    .addColumn('titleEn', 'varchar(500)', (col) => col.notNull())
    .addColumn('contentRu', 'text', (col) => col.notNull())
    .addColumn('contentTm', 'text', (col) => col.notNull())
    .addColumn('contentEn', 'text', (col) => col.notNull())
    .addColumn('imageUrl', 'varchar(500)')
    .addColumn('isFlash', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('categoryId', 'integer', (col) =>
      col.references('categories.id').onDelete('cascade')
    )
    .addColumn('authorId', 'integer', (col) =>
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('publishedAt', 'timestamp')
    .addColumn('createdAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();
}
