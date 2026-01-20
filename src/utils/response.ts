import { Response } from 'express';

/**
 * Успешный ответ
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Ответ с ошибкой
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: any
) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
}

/**
 * Ответ с пагинацией
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
) {
  return res.json({
    success: true,
    data,
    pagination,
  });
}