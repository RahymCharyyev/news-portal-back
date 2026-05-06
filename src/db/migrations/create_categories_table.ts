import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

export async function createCategoriesTable() {
  await db.schema
    .createTable('categories')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('nameRu', 'varchar(255)', (col) => col.notNull())
    .addColumn('nameTm', 'varchar(255)', (col) => col.notNull())
    .addColumn('nameEn', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('descriptionRu', 'text')
    .addColumn('descriptionTm', 'text')
    .addColumn('descriptionEn', 'text')
    .addColumn('createdAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();
}
