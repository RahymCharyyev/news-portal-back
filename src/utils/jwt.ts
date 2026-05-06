import jwt, { SignOptions } from 'jsonwebtoken';

type UserRole = 'admin' | 'user';

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
export function generateToken(userId: number, role: UserRole): string {
  return jwt.sign(
    { userId, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
  );
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): { userId: number; role: UserRole } {
  const decoded = jwt.verify(token, getJwtSecret());
  
  if (
    typeof decoded === 'string' ||
    !decoded ||
    typeof decoded !== 'object' ||
    !('userId' in decoded) ||
    !('role' in decoded)
  ) {
    throw new Error('Неверный формат токена');
  }
  
  return decoded as { userId: number; role: UserRole };
}
