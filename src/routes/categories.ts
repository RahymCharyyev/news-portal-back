import { Router } from 'express';
import { db } from '../config/database';
import { createCategorySchema, updateCategorySchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/categories - Получить все категории
router.get('/', async (req, res, next) => {
  try {
    const categories = await db
      .selectFrom('categories')
      .selectAll()
      .orderBy('name', 'asc')
      .execute();
    
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:slug - Получить категорию по slug
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', req.params.slug)
      .executeTakeFirst();
    
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
    
    const category = await db
      .insertInto('categories')
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    res.status(201).json({ category });
  } catch (error: any) {
    next(error);
  }
});

// PUT /api/categories/:id - Обновить категорию (требует авторизации)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    // Проверяем, существует ли категория
    const existingCategory = await db
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', categoryId)
      .executeTakeFirst();
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Валидация через Zod
    const validatedData = updateCategorySchema.parse(req.body);
    
    // Собираем данные для обновления
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.slug) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    updateData.updatedAt = new Date();
    
    const category = await db
      .updateTable('categories')
      .set(updateData)
      .where('id', '=', categoryId)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    res.json({ category });
  } catch (error: any) {
    next(error);
  }
});

// DELETE /api/categories/:id - Удалить категорию (требует авторизации)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    // Проверяем, существует ли категория
    const existingCategory = await db
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', categoryId)
      .executeTakeFirst();
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Удаляем категорию (благодаря ON DELETE CASCADE удалятся и связанные новости)
    await db
      .deleteFrom('categories')
      .where('id', '=', categoryId)
      .execute();
    
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    next(error);
  }
});

export default router;