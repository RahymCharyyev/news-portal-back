import { db } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../types/schemas';

export interface UserResponse {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

/**
 * Сервис для работы с авторизацией
 */
export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', data.email)
      .executeTakeFirst();

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(data.password);

    // Создаем пользователя
    const user = await db
      .insertInto('users')
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
      })
      .returning(['id', 'email', 'name', 'createdAt'])
      .executeTakeFirstOrThrow();

    // Создаем JWT токен
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Вход пользователя
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    // Ищем пользователя по email
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', data.email)
      .executeTakeFirst();

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Сравниваем пароль с хешем
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Создаем JWT токен
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(userId: number): Promise<UserResponse | null> {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

export const authService = new AuthService();
