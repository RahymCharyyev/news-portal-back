import { db } from '../config/database';

export const usersRepository = {
  findIdByEmail(email: string) {
    return db.selectFrom('users').select(['id']).where('email', '=', email).executeTakeFirst();
  },

  findByEmail(email: string) {
    return db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
  },

  findById(id: number) {
    return db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'isBlocked', 'createdAt'])
      .where('id', '=', id)
      .executeTakeFirst();
  },

  findPublicById(id: number) {
    return db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'isBlocked'])
      .where('id', '=', id)
      .executeTakeFirst();
  },

  list() {
    return db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'isBlocked', 'createdAt'])
      .orderBy('id', 'desc')
      .execute();
  },

  create(values: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
    isBlocked: boolean;
  }) {
    return db
      .insertInto('users')
      .values(values)
      .returning(['id', 'email', 'name', 'role', 'isBlocked', 'createdAt'])
      .executeTakeFirstOrThrow();
  },

  findDuplicateEmail(email: string, excludeId: number) {
    return db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .where('id', '!=', excludeId)
      .executeTakeFirst();
  },

  update(
    id: number,
    patch: Partial<{
      email: string;
      name: string;
      password: string;
      role: 'admin' | 'user';
      isBlocked: boolean;
    }>
  ) {
    return db
      .updateTable('users')
      .set(patch)
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'role', 'isBlocked', 'createdAt'])
      .executeTakeFirst();
  },

  remove(id: number) {
    return db.deleteFrom('users').where('id', '=', id).returning('id').executeTakeFirst();
  },
};
