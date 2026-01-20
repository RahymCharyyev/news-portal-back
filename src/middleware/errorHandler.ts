import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Middleware для централизованной обработки ошибок
 * Должен быть последним middleware в цепочке
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Ошибка валидации Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: error.errors,
    });
  }

  // Ошибка базы данных (уникальное ограничение)
  if (error.code === '23505') {
    return res.status(400).json({
      error: 'Запись с такими данными уже существует',
    });
  }

  // Ошибка базы данных (внешний ключ)
  if (error.code === '23503') {
    return res.status(400).json({
      error: 'Связанная запись не найдена',
    });
  }

  // Ошибка JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Неверный токен',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Токен истек',
    });
  }

  // Неизвестная ошибка
  console.error('Ошибка:', error);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    // В продакшене не показывайте детали ошибки!
    ...(process.env.NODE_ENV === 'development' && { message: error.message }),
  });
}