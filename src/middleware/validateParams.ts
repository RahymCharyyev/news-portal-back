import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для валидации параметров запроса (ID, slug и т.д.)
 */
export function validateIdParam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'ID не предоставлен' });
  }

  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ error: 'Некорректный ID' });
  }

  // Добавляем валидированный ID в req.params
  req.params.id = parsedId.toString();

  next();
}