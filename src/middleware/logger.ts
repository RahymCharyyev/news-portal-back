import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для логирования всех запросов
 * Показывает метод, путь, время выполнения и статус ответа
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Перехватываем метод res.json, чтобы узнать статус ответа
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );

    // Вызываем оригинальный метод
    return originalJson.call(this, body);
  };

  next();
}