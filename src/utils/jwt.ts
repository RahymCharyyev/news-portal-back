import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET не настроен в переменных окружения');
}

/**
 * Генерирует JWT токен для пользователя
 */
export function generateToken(userId: number): string {
  return jwt.sign(
    { userId },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): { userId: number } {
  const decoded = jwt.verify(token, JWT_SECRET as string);
  
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
    throw new Error('Неверный формат токена');
  }
  
  return decoded as { userId: number };
}
