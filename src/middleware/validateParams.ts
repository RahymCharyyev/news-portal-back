import { Request, Response, NextFunction } from 'express';
import { idParamSchema } from '../types/schemas';

/**
 * Middleware для валидации параметров запроса (ID, slug и т.д.)
 */
export function validateIdParam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id: parsedId } = idParamSchema.parse(req.params);

  // Добавляем валидированный ID в req.params
  req.params.id = parsedId.toString();

  next();
}