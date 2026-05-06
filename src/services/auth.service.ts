import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../types/schemas';
import { usersRepository } from '../repositories/users.repository';

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

async function register(data: RegisterInput): Promise<AuthResponse> {
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await usersRepository.findIdByEmail(data.email);

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(data.password);

    // Создаем пользователя
    const user = await usersRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'user',
      isBlocked: false,
    });

    // Создаем JWT токен
    const token = generateToken(user.id, user.role as 'admin' | 'user');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isBlocked: user.isBlocked,
      },
      token,
    };
}

  /**
   * Вход пользователя
   */
async function login(data: LoginInput): Promise<AuthResponse> {
    // Ищем пользователя по email
    const user = await usersRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Сравниваем пароль с хешем
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    if (user.isBlocked) {
      throw new Error('Аккаунт заблокирован');
    }

    // Создаем JWT токен
    const token = generateToken(user.id, user.role as 'admin' | 'user');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'user',
        isBlocked: user.isBlocked,
      },
      token,
    };
}

  /**
   * Получить пользователя по ID
   */
async function getUserById(userId: number): Promise<UserResponse | null> {
    const user = await usersRepository.findPublicById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'user',
      isBlocked: user.isBlocked,
    };
}

export const authService = {
  register,
  login,
  getUserById,
};
