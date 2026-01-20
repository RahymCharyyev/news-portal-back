import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { loginSchema, registerSchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register - Регистрация
router.post('/register', async (req, res, next) => {
  try {
    // Валидация данных
    const validatedData = registerSchema.parse(req.body);

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', validatedData.email)
      .executeTakeFirst();

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(validatedData.password);

    // Создаем пользователя
    const user = await db
      .insertInto('users')
      .values({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      })
      .returning(['id', 'email', 'name', 'createdAt'])
      .executeTakeFirstOrThrow();

    // Проверяем наличие JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не настроен в переменных окружения');
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    // Возвращаем пользователя и токен
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    next(error);
  }
});

// POST /api/auth/login - Вход
router.post('/login', async (req, res, next) => {
  try {
    // Валидация данных
    const validatedData = loginSchema.parse(req.body);

    // Ищем пользователя по email
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', validatedData.email)
      .executeTakeFirst();

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сравниваем пароль с хешем
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем наличие JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не настроен в переменных окружения');
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    // Возвращаем пользователя (БЕЗ пароля!) и токен
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    next(error);
  }
});

// GET /api/auth/me - Получить текущего пользователя
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Пользователь уже добавлен в req через middleware authenticate
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;