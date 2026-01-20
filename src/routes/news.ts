import { Router } from 'express';
import { db } from '../config/database';
import { createNewsSchema, updateNewsSchema, newsQuerySchema } from '../types/schemas';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/news - Получить все новости (с информацией о категории и авторе)
router.get('/', async (req, res, next) => {
  try {
    // Валидация query параметров
    const queryParams = newsQuerySchema.parse(req.query);
    
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const categoryId = queryParams.categoryId;

    // Параметры сортировки
    const sortBy = queryParams.sortBy || 'publishedAt';
    const sortOrder = queryParams.sortOrder || 'desc';

    // Строим запрос с JOIN для получения связанных данных
    let query = db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.publishedAt',
        'news.createdAt',
        'news.updatedAt',
        'categories.id as categoryId',
        'categories.name as categoryName',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
        'users.email as authorEmail',
      ])
      .where('news.publishedAt', 'is not', null); // Только опубликованные новости

    // Фильтр по категории, если указан
    if (categoryId) {
      query = query.where('news.categoryId', '=', categoryId);
    }

    // Фильтр по дате (опционально)
    if (queryParams.startDate) {
      query = query.where('news.publishedAt', '>=', new Date(queryParams.startDate));
    }

    if (queryParams.endDate) {
      query = query.where('news.publishedAt', '<=', new Date(queryParams.endDate));
    }

    // Сортировка
    const validSortFields = ['publishedAt', 'createdAt', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'publishedAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    query = query.orderBy(`news.${sortField}` as any, order);

    // Получаем новости с пагинацией
    const news = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    // Получаем общее количество для пагинации
    let totalQuery = db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('news.publishedAt', 'is not', null);

    if (categoryId) {
      totalQuery = totalQuery.where('news.categoryId', '=', categoryId);
    }

    if (queryParams.startDate) {
      totalQuery = totalQuery.where('news.publishedAt', '>=', new Date(queryParams.startDate));
    }

    if (queryParams.endDate) {
      totalQuery = totalQuery.where('news.publishedAt', '<=', new Date(queryParams.endDate));
    }

    const totalResult = await totalQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    res.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      sort: {
        by: sortField,
        order: order,
      },
    });
  } catch (error) {
    next(error);
  }
});


// GET /api/news/category/:slug - Получить новости по категории
router.get('/category/:slug', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Сначала находим категорию по slug
    const category = await db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', req.params.slug)
      .executeTakeFirst();

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    // Получаем новости этой категории
    const news = await db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.publishedAt',
        'news.createdAt',
        'categories.id as categoryId',
        'categories.name as categoryName',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
      ])
      .where('news.categoryId', '=', category.id)
      .where('news.publishedAt', 'is not', null)
      .orderBy('news.publishedAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    // Получаем общее количество
    const totalResult = await db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('categoryId', '=', category.id)
      .where('publishedAt', 'is not', null)
      .executeTakeFirst();

    const total = Number(totalResult?.total || 0);

    res.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/news/search?q=запрос - Поиск новостей
router.get('/search', async (req, res, next) => {
  try {
    const searchQuery = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({ error: 'Поисковый запрос обязателен' });
    }

    // Поиск по заголовку и содержанию (используем ILIKE для регистронезависимого поиска)
    let query = db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.publishedAt',
        'news.createdAt',
        'categories.id as categoryId',
        'categories.name as categoryName',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
      ])
      .where('news.publishedAt', 'is not', null)
      .where((eb) =>
        eb.or([
          eb('news.title', 'ilike', `%${searchQuery}%`),
          eb('news.content', 'ilike', `%${searchQuery}%`),
        ])
      )
      .orderBy('news.publishedAt', 'desc');

    // Получаем результаты с пагинацией
    const news = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    // Получаем общее количество
    const totalQuery = db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('publishedAt', 'is not', null)
      .where((eb) =>
        eb.or([
          eb('news.title', 'ilike', `%${searchQuery}%`),
          eb('news.content', 'ilike', `%${searchQuery}%`),
        ])
      );

    const totalResult = await totalQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    res.json({
      query: searchQuery,
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/news/:id - Получить новость по ID
router.get('/:id', async (req, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    const news = await db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.publishedAt',
        'news.createdAt',
        'news.updatedAt',
        'categories.id as categoryId',
        'categories.name as categoryName',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
        'users.email as authorEmail',
      ])
      .where('news.id', '=', newsId)
      .executeTakeFirst();

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

    const news = await db
      .insertInto('news')
      .values({
        title: validatedData.title,
        content: validatedData.content,
        categoryId: validatedData.categoryId,
        authorId: req.userId!,
        publishedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    res.status(201).json({ news });
  } catch (error: any) {
    next(error);
  }
});

// PUT /api/news/:id - Обновить новость (только автор)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    // Проверяем, существует ли новость и принадлежит ли она пользователю
    const existingNews = await db
      .selectFrom('news')
      .selectAll()
      .where('id', '=', newsId)
      .executeTakeFirst();

    if (!existingNews) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    if (existingNews.authorId !== req.userId) {
      return res.status(403).json({ error: 'Нет доступа к этой новости' });
    }

    // Валидация через Zod
    const validatedData = updateNewsSchema.parse(req.body);

    // Собираем данные для обновления
    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.content) updateData.content = validatedData.content;
    if (validatedData.categoryId) updateData.categoryId = validatedData.categoryId;
    updateData.updatedAt = new Date();

    const news = await db
      .updateTable('news')
      .set(updateData)
      .where('id', '=', newsId)
      .returningAll()
      .executeTakeFirstOrThrow();

    res.json({ news });
  } catch (error: any) {
    next(error);
  }
});

// DELETE /api/news/:id - Удалить новость (только автор)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const newsId = parseInt(req.params.id);

    // Проверяем, существует ли новость и принадлежит ли она пользователю
    const existingNews = await db
      .selectFrom('news')
      .selectAll()
      .where('id', '=', newsId)
      .executeTakeFirst();

    if (!existingNews) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    if (existingNews.authorId !== req.userId) {
      return res.status(403).json({ error: 'Нет доступа к этой новости' });
    }

    await db
      .deleteFrom('news')
      .where('id', '=', newsId)
      .execute();

    res.json({ message: 'Новость успешно удалена' });
  } catch (error) {
    next(error);
  }
});

export default router;