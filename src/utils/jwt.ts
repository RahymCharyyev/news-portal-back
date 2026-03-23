import jwt, { SignOptions } from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не настроен в переменных окружения. Добавьте JWT_SECRET в файл .env');
  }
  return secret;
}

/**
 * Генерирует JWT токен для пользователя
 */
export function generateToken(userId: number): string {
  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
  );
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): { userId: number } {
  const decoded = jwt.verify(token, getJwtSecret());
  
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
    throw new Error('Неверный формат токена');
  }
  
  return decoded as { userId: number };
}
