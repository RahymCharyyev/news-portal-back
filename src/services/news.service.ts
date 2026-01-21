import { db } from '../config/database';
import { CreateNewsInput, UpdateNewsInput, NewsQueryInput, Language } from '../types/schemas';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';

export interface NewsListItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isFlash: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  authorId: number;
  authorName: string;
  authorEmail?: string;
}

export interface NewsDetail extends NewsListItem {
  updatedAt: Date | null;
}

interface NewsRawData {
  id: number;
  titleRu: string;
  titleTm: string;
  contentRu: string;
  contentTm: string;
  imageUrl: string | null;
  isFlash: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  categoryId: number;
  categoryNameRu: string;
  categoryNameTm: string;
  categorySlug: string;
  authorId: number;
  authorName: string;
  authorEmail?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NewsListResponse {
  news: NewsListItem[];
  pagination: PaginationMeta;
  sort?: {
    by: string;
    order: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  query?: string;
}

/**
 * Сервис для работы с новостями
 */
export class NewsService {
  /**
   * Преобразует сырые данные новости в локализованный формат
   */
  private mapToLocalized(news: NewsRawData, lang: Language = 'ru'): NewsListItem {
    return {
      id: news.id,
      title: lang === 'ru' ? news.titleRu : news.titleTm,
      content: lang === 'ru' ? news.contentRu : news.contentTm,
      imageUrl: news.imageUrl,
      isFlash: news.isFlash,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      categoryId: news.categoryId,
      categoryName: lang === 'ru' ? news.categoryNameRu : news.categoryNameTm,
      categorySlug: news.categorySlug,
      authorId: news.authorId,
      authorName: news.authorName,
      authorEmail: news.authorEmail,
    };
  }

  /**
   * Базовый запрос для получения новостей с JOIN
   */
  private getBaseNewsQuery() {
    return db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.titleRu',
        'news.titleTm',
        'news.contentRu',
        'news.contentTm',
        'news.imageUrl',
        'news.isFlash',
        'news.publishedAt',
        'news.createdAt',
        'news.updatedAt',
        'categories.id as categoryId',
        'categories.nameRu as categoryNameRu',
        'categories.nameTm as categoryNameTm',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
        'users.email as authorEmail',
      ]);
  }

  /**
   * Получить список новостей с фильтрацией и пагинацией
   */
  async getList(query: NewsQueryInput): Promise<NewsListResponse> {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    const categoryId = query.categoryId;
    const lang = query.lang || 'ru';
    const isFlash = query.isFlash;

    // Параметры сортировки
    let sortBy: string = query.sortBy || 'publishedAt';
    // Если сортировка по заголовку, используем правильное поле в зависимости от языка
    if (sortBy === 'titleRu' || sortBy === 'titleTm') {
      sortBy = lang === 'ru' ? 'titleRu' : 'titleTm';
    } else if (sortBy === 'title') {
      sortBy = lang === 'ru' ? 'titleRu' : 'titleTm';
    } else if (sortBy !== 'publishedAt' && sortBy !== 'createdAt' && sortBy !== 'titleRu' && sortBy !== 'titleTm') {
      sortBy = 'publishedAt'; // По умолчанию, если неверное значение
    }
    const sortOrder = query.sortOrder || 'desc';

    // Строим запрос
    let baseQuery = this.getBaseNewsQuery()
      .where('news.publishedAt', 'is not', null);

    // Фильтр по категории
    if (categoryId) {
      baseQuery = baseQuery.where('news.categoryId', '=', categoryId);
    }

    // Фильтр по срочным новостям
    if (isFlash !== undefined) {
      baseQuery = baseQuery.where('news.isFlash', '=', isFlash);
    }

    // Фильтр по дате
    if (query.startDate) {
      baseQuery = baseQuery.where('news.publishedAt', '>=', new Date(query.startDate));
    }

    if (query.endDate) {
      baseQuery = baseQuery.where('news.publishedAt', '<=', new Date(query.endDate));
    }

    // Сортировка
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const newsQuery = baseQuery
      .orderBy(`news.${sortBy}` as any, order)
      .limit(limit)
      .offset((page - 1) * limit);

    // Получаем новости
    const newsRaw = await newsQuery.execute();
    const news = newsRaw.map(item => this.mapToLocalized(item as NewsRawData, lang));

    // Получаем общее количество
    let totalQuery = db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('news.publishedAt', 'is not', null);

    if (categoryId) {
      totalQuery = totalQuery.where('news.categoryId', '=', categoryId);
    }

    if (isFlash !== undefined) {
      totalQuery = totalQuery.where('news.isFlash', '=', isFlash);
    }

    if (query.startDate) {
      totalQuery = totalQuery.where('news.publishedAt', '>=', new Date(query.startDate));
    }

    if (query.endDate) {
      totalQuery = totalQuery.where('news.publishedAt', '<=', new Date(query.endDate));
    }

    const totalResult = await totalQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    return {
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      sort: {
        by: sortBy,
        order: order,
      },
    };
  }

  /**
   * Получить новости по категории
   */
  async getByCategorySlug(slug: string, page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT, lang: Language = 'ru'): Promise<NewsListResponse> {
    // Находим категорию
    const category = await db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!category) {
      throw new Error('Категория не найдена');
    }

    // Получаем новости
    const newsRaw = await this.getBaseNewsQuery()
      .where('news.categoryId', '=', category.id)
      .where('news.publishedAt', 'is not', null)
      .orderBy('news.publishedAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    const news = newsRaw.map(item => this.mapToLocalized(item as NewsRawData, lang));

    // Получаем общее количество
    const totalResult = await db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('categoryId', '=', category.id)
      .where('publishedAt', 'is not', null)
      .executeTakeFirst();

    const total = Number(totalResult?.total || 0);

    return {
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      category: {
        id: category.id,
        name: lang === 'ru' ? category.nameRu : category.nameTm,
        slug: category.slug,
      },
    };
  }

  /**
   * Поиск новостей
   */
  async search(searchQuery: string, page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT, lang: Language = 'ru'): Promise<NewsListResponse> {
    if (!searchQuery || searchQuery.trim().length === 0) {
      throw new Error('Поисковый запрос обязателен');
    }

    // Поиск по заголовку и содержанию в зависимости от языка
    const titleField = lang === 'ru' ? 'news.titleRu' : 'news.titleTm';
    const contentField = lang === 'ru' ? 'news.contentRu' : 'news.contentTm';

    const newsRaw = await this.getBaseNewsQuery()
      .where('news.publishedAt', 'is not', null)
      .where((eb) =>
        eb.or([
          eb(titleField as any, 'ilike', `%${searchQuery}%`),
          eb(contentField as any, 'ilike', `%${searchQuery}%`),
        ])
      )
      .orderBy('news.publishedAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    const news = newsRaw.map(item => this.mapToLocalized(item as NewsRawData, lang));

    // Получаем общее количество
    const totalQuery = db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('publishedAt', 'is not', null)
      .where((eb) =>
        eb.or([
          eb(titleField as any, 'ilike', `%${searchQuery}%`),
          eb(contentField as any, 'ilike', `%${searchQuery}%`),
        ])
      );

    const totalResult = await totalQuery.executeTakeFirst();
    const total = Number(totalResult?.total || 0);

    return {
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      query: searchQuery,
    };
  }

  /**
   * Получить новость по ID
   */
  async getById(id: number, lang: Language = 'ru'): Promise<NewsDetail | null> {
    const news = await this.getBaseNewsQuery()
      .where('news.id', '=', id)
      .executeTakeFirst();

    if (!news) {
      return null;
    }

    return this.mapToLocalized(news as NewsRawData, lang) as NewsDetail;
  }

  /**
   * Создать новость
   */
  async create(data: CreateNewsInput, authorId: number) {
    return await db
      .insertInto('news')
      .values({
        titleRu: data.titleRu,
        titleTm: data.titleTm,
        contentRu: data.contentRu,
        contentTm: data.contentTm,
        imageUrl: data.imageUrl || null,
        isFlash: data.isFlash || false,
        categoryId: data.categoryId,
        authorId,
        publishedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Обновить новость
   */
  async update(id: number, data: UpdateNewsInput, userId: number) {
    // Проверяем существование и права доступа
    const existing = await db
      .selectFrom('news')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new Error('Новость не найдена');
    }

    if (existing.authorId !== userId) {
      throw new Error('Нет доступа к этой новости');
    }

    // Собираем данные для обновления
    const updateData: {
      titleRu?: string;
      titleTm?: string;
      contentRu?: string;
      contentTm?: string;
      imageUrl?: string | null;
      isFlash?: boolean;
      categoryId?: number;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.titleRu) updateData.titleRu = data.titleRu;
    if (data.titleTm) updateData.titleTm = data.titleTm;
    if (data.contentRu) updateData.contentRu = data.contentRu;
    if (data.contentTm) updateData.contentTm = data.contentTm;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isFlash !== undefined) updateData.isFlash = data.isFlash;
    if (data.categoryId) updateData.categoryId = data.categoryId;

    return await db
      .updateTable('news')
      .set(updateData as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Удалить новость
   */
  async delete(id: number, userId: number): Promise<void> {
    // Проверяем существование и права доступа
    const existing = await db
      .selectFrom('news')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new Error('Новость не найдена');
    }

    if (existing.authorId !== userId) {
      throw new Error('Нет доступа к этой новости');
    }

    await db
      .deleteFrom('news')
      .where('id', '=', id)
      .execute();
  }
}

export const newsService = new NewsService();
