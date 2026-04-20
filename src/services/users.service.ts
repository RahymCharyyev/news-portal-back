import { db } from '../config/database';
import { hashPassword } from '../utils/password';
import type { CreateUserInput, UpdateUserInput } from '../types/schemas';

export interface UserListItem {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export class UsersService {
  async list(): Promise<UserListItem[]> {
    const rows = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'createdAt'])
      .orderBy('id', 'desc')
      .execute();
    return rows.map((row) => ({
      ...row,
      role: row.role as 'admin' | 'user',
    }));
  }

  async getById(id: number): Promise<UserListItem> {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'createdAt'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return { ...user, role: user.role as 'admin' | 'user' };
  }

  async create(data: CreateUserInput): Promise<UserListItem> {
    const existing = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', data.email)
      .executeTakeFirst();
    if (existing) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const password = await hashPassword(data.password);
    const user = await db
      .insertInto('users')
      .values({
        email: data.email,
        name: data.name,
        password,
        role: data.role,
      })
      .returning(['id', 'email', 'name', 'role', 'createdAt'])
      .executeTakeFirstOrThrow();
    return { ...user, role: user.role as 'admin' | 'user' };
  }

  async update(id: number, data: UpdateUserInput): Promise<UserListItem> {
    const patch: Partial<{
      email: string;
      name: string;
      password: string;
      role: 'admin' | 'user';
    }> = {};
    if (data.email) patch.email = data.email;
    if (data.name) patch.name = data.name;
    if (data.role) patch.role = data.role;
    if (data.password) patch.password = await hashPassword(data.password);

    if (!Object.keys(patch).length) {
      throw new Error('Нет данных для обновления');
    }

    if (data.email) {
      const existing = await db
        .selectFrom('users')
        .select('id')
        .where('email', '=', data.email)
        .where('id', '!=', id)
        .executeTakeFirst();
      if (existing) {
        throw new Error('Пользователь с таким email уже существует');
      }
    }

    const updated = await db
      .updateTable('users')
      .set(patch)
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'role', 'createdAt'])
      .executeTakeFirst();

    if (!updated) {
      throw new Error('Пользователь не найден');
    }

    return { ...updated, role: updated.role as 'admin' | 'user' };
  }

  async remove(id: number): Promise<void> {
    const deleted = await db
      .deleteFrom('users')
      .where('id', '=', id)
      .returning('id')
      .executeTakeFirst();
    if (!deleted) {
      throw new Error('Пользователь не найден');
    }
  }
}

export const usersService = new UsersService();
