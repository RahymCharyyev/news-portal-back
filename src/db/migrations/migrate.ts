import dotenv from 'dotenv';
import { db } from '../../config/database';
import { sql } from 'kysely';

// ⬇️ ВАЖНО: Загружаем переменные из .env ПЕРЕД использованием db
dotenv.config();

async function migrate() {
  try {
    console.log('🔄 Создание таблиц...');

    // Создаем таблицу users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    console.log('✅ Таблица users создана');

    // Создаем таблицу categories
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    console.log('✅ Таблица categories создана');

    // Создаем таблицу news
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        "categoryId" INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        "authorId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    console.log('✅ Таблица news создана');

    console.log('🎉 Все таблицы созданы успешно!');
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
    throw error;
  } finally {
    await db.destroy(); // Закрываем соединение
  }
}

migrate();