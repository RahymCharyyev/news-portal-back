import 'dotenv/config';
import { db } from '../../config/database';
import { createUsersTable } from './create_users_table';
import { createCategoriesTable } from './create_categories_table';
import { createNewsTable } from './create_news_table';

async function migrate() {
  try {
    console.log('🔄 Запуск всех миграций...');

    await createUsersTable();
    console.log('✅ Таблица users создана');

    await createCategoriesTable();
    console.log('✅ Таблица categories создана');

    await createNewsTable();
    console.log('✅ Таблица news создана');

    console.log('🎉 Все миграции выполнены успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error);
    throw error;
  } finally {
    await db.destroy(); // Закрываем соединение
  }
}

migrate();