import { Router } from 'express';
import { loginSchema, registerSchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';

const router = Router();

// POST /api/auth/register - Регистрация
router.post('/register', async (req, res, next) => {
  try {
    // Валидация данных
    const validatedData = registerSchema.parse(req.body);

    // Регистрация через сервис
    const result = await authService.register(validatedData);

    // Возвращаем пользователя и токен
    res.status(201).json(result);
  } catch (error) {
    // Обрабатываем ошибки из сервиса
    if (error instanceof Error && error.message === 'Пользователь с таким email уже существует') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// POST /api/auth/login - Вход
router.post('/login', async (req, res, next) => {
  try {
    // Валидация данных
    const validatedData = loginSchema.parse(req.body);

    // Вход через сервис
    const result = await authService.login(validatedData);

    // Возвращаем пользователя и токен
    res.json(result);
  } catch (error) {
    // Обрабатываем ошибки из сервиса
    if (error instanceof Error && error.message === 'Неверный email или пароль') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/auth/me - Получить текущего пользователя
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Пользователь уже добавлен в req через middleware authenticate
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;