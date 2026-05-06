import 'dotenv/config';
import { db } from '../../config/database';
import { sql } from 'kysely';

export async function createUsersTable() {
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('role', 'varchar(16)', (col) => col.notNull().defaultTo('user'))
    .addColumn('isBlocked', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('createdAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();
}
