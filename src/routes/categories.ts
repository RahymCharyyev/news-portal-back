import { Router } from 'express';
import { createCategorySchema, updateCategorySchema, languageSchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';
import { categoryService } from '../services/category.service';

const router = Router();

// GET /api/categories?lang=ru|tm - Получить все категории
router.get('/', async (req, res, next) => {
  try {
    const lang = languageSchema.parse(req.query.lang || 'ru');
    const categories = await categoryService.getAll(lang);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:slug?lang=ru|tm - Получить категорию по slug
router.get('/:slug', async (req, res, next) => {
  try {
    const lang = languageSchema.parse(req.query.lang || 'ru');
    const category = await categoryService.getBySlug(req.params.slug, lang);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories - Создать категорию (требует авторизации)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Валидация через Zod
    const validatedData = createCategorySchema.parse(req.body);
    
    const category = await categoryService.create(validatedData);
    
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id - Обновить категорию (требует авторизации)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' });
    }
    
    // Валидация через Zod
    const validatedData = updateCategorySchema.parse(req.body);
    
    const category = await categoryService.update(categoryId, validatedData);
    
    res.json({ category });
  } catch (error) {
    if (error instanceof Error && error.message === 'Категория не найдена') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/categories/:id - Удалить категорию (требует авторизации)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'Некорректный ID' });
    }
    
    await categoryService.delete(categoryId);
    
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Категория не найдена') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default router;