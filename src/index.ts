import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRoutes from './routes/categories';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import { errorHandler } from './middleware/errorHandler'; // ⬅️ Добавьте
import { requestLogger } from './middleware/logger';

// Загружаем переменные из .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger); // ⬅️ Логирование должно быть после express.json()

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/news', newsRoutes);

// Роут: Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Обработка 404 - роут не найден
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Роут не найден',
    path: req.path,
    method: req.method,
  });
});

// ⬇️ Обработчик ошибок должен быть ПОСЛЕДНИМ!
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api/categories`);
  console.log(`   - GET  /api/categories/:slug`);
  console.log(`   - POST /api/categories (authenticated)`);
  console.log(`   - PUT  /api/categories/:id (authenticated)`);
  console.log(`   - DELETE /api/categories/:id (authenticated)`);
  console.log(`   - GET  /api/news`);
  console.log(`   - GET  /api/news/search`);
  console.log(`   - GET  /api/news/category/:slug`);
  console.log(`   - GET  /api/news/:id`);
  console.log(`   - POST /api/news (authenticated)`);
  console.log(`   - PUT  /api/news/:id (authenticated)`);
  console.log(`   - DELETE /api/news/:id (authenticated)`);
});