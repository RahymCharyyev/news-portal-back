import 'dotenv/config'; // Загружаем .env первым, до остальных импортов
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import categoriesRoutes from './routes/categories';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import uploadRoutes from './routes/upload';
import usersRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/news/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);

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
});
