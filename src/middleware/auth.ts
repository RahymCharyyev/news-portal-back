import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

// Расширяем тип Request, чтобы добавить userId
export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

/**
 * Middleware для проверки JWT токена
 * Добавляет userId в req, если токен валиден
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Получаем токен из заголовка Authorization
    // Формат: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    // Извлекаем токен (убираем "Bearer ")
    const token = authHeader.substring(7);

    // Проверяем токен
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };

    // Проверяем, существует ли пользователь
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name'])
      .where('id', '=', decoded.userId)
      .executeTakeFirst();

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Добавляем информацию о пользователе в req
    req.userId = user.id;
    req.user = user;

    // Передаем управление следующему middleware/роуту
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
}