import { hashPassword } from '../utils/password';
import type { CreateUserInput, UpdateUserInput } from '../types/schemas';
import { usersRepository } from '../repositories/users.repository';

export interface UserListItem {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  createdAt: Date | null;
}

async function list(): Promise<UserListItem[]> {
    const rows = await usersRepository.list();
    return rows.map((row) => ({
      ...row,
      role: row.role as 'admin' | 'user',
    }));
}

async function getById(id: number): Promise<UserListItem> {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return { ...user, role: user.role as 'admin' | 'user' };
}

async function create(data: CreateUserInput): Promise<UserListItem> {
    const existing = await usersRepository.findIdByEmail(data.email);
    if (existing) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const password = await hashPassword(data.password);
    const user = await usersRepository.create({
      email: data.email,
      name: data.name,
      password,
      role: data.role,
      isBlocked: data.isBlocked,
    });
    return { ...user, role: user.role as 'admin' | 'user' };
}

async function update(id: number, data: UpdateUserInput): Promise<UserListItem> {
    const patch: Partial<{
      email: string;
      name: string;
      password: string;
      role: 'admin' | 'user';
      isBlocked: boolean;
    }> = {};
    if (data.email) patch.email = data.email;
    if (data.name) patch.name = data.name;
    if (data.role) patch.role = data.role;
    if (data.password) patch.password = await hashPassword(data.password);
    if (data.isBlocked !== undefined) patch.isBlocked = data.isBlocked;

    if (!Object.keys(patch).length) {
      throw new Error('Нет данных для обновления');
    }

    if (data.email) {
      const existing = await usersRepository.findDuplicateEmail(data.email, id);
      if (existing) {
        throw new Error('Пользователь с таким email уже существует');
      }
    }

    const updated = await usersRepository.update(id, patch);

    if (!updated) {
      throw new Error('Пользователь не найден');
    }

    return { ...updated, role: updated.role as 'admin' | 'user' };
}

async function remove(id: number): Promise<void> {
    const deleted = await usersRepository.remove(id);
    if (!deleted) {
      throw new Error('Пользователь не найден');
    }
}

export const usersService = {
  list,
  getById,
  create,
  update,
  remove,
};
