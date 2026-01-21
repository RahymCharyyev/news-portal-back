import { Router } from 'express';
import { createNewsSchema, updateNewsSchema, newsQuerySchema, searchSchema, languageSchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';
import { newsService } from '../services/news.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';

const router = Router();

// GET /api/news - Получить все новости (с информацией о категории и авторе)
router.get('/', async (req, res, next) => {
  try {
    // Валидация query параметров
    const queryParams = newsQuerySchema.parse(req.query);
    
    const result = await newsService.getList(queryParams);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});


// GET /api/news/category/:slug?lang=ru|tm - Получить новости по категории
router.get('/category/:slug', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
    const lang = languageSchema.parse(req.query.lang || 'ru');

    const result = await newsService.getByCategorySlug(req.params.slug, page, limit, lang);
    
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Категория не найдена') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/news/search?q=запрос&lang=ru|tm - Поиск новостей
router.get('/search', async (req, res, next) => {
  try {
    const validatedQuery = searchSchema.parse(req.query);
    const page = validatedQuery.page || DEFAULT_PAGE;
    const limit = validatedQuery.limit || DEFAULT_LIMIT;
    const lang = validatedQuery.lang || 'ru';

    const result = await newsService.search(validatedQuery.q, page, limit, lang);
    
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Поисковый запрос обязателен') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/news/:id?lang=ru|tm - Получить новость по ID
router.get('/:id', async (req, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    if (isNaN(newsId) || newsId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' });
    }

    const lang = languageSchema.parse(req.query.lang || 'ru');
    const news = await newsService.getById(newsId, lang);

    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json({ news });
  } catch (error) {
    next(error);
  }
});

// POST /api/news - Создать новость (требует авторизации)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createNewsSchema.parse(req.body);

    if (!req.userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const news = await newsService.create(validatedData, req.userId);

    res.status(201).json({ news });
  } catch (error) {
    next(error);
  }
});

// PUT /api/news/:id - Обновить новость (только автор)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    if (isNaN(newsId) || newsId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    // Валидация через Zod
    const validatedData = updateNewsSchema.parse(req.body);

    const news = await newsService.update(newsId, validatedData, req.userId);

    res.json({ news });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Новость не найдена') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Нет доступа к этой новости') {
        return res.status(403).json({ error: error.message });
      }
    }
    next(error);
  }
});

// DELETE /api/news/:id - Удалить новость (только автор)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    if (isNaN(newsId) || newsId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    await newsService.delete(newsId, req.userId);

    res.json({ message: 'Новость успешно удалена' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Новость не найдена') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Нет доступа к этой новости') {
        return res.status(403).json({ error: error.message });
      }
    }
    next(error);
  }
});

export default router;