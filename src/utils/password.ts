import bcrypt from 'bcryptjs';

/**
 * Хеширует пароль перед сохранением в БД
 * @param password - обычный пароль
 * @returns хешированный пароль
 */
export async function hashPassword(password: string): Promise<string> {
  // 10 - это "соль" (salt rounds) - чем больше, тем безопаснее, но медленнее
  return bcrypt.hash(password, 10);
}

/**
 * Сравнивает обычный пароль с хешем
 * @param password - пароль от пользователя
 * @param hash - хеш из базы данных
 * @returns true если пароли совпадают
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}