import { db } from '../config/database';
import { CreateCategoryInput, UpdateCategoryInput, Language } from '../types/schemas';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CategoryFullResponse {
  id: number;
  nameRu: string;
  nameTm: string;
  slug: string;
  descriptionRu: string | null;
  descriptionTm: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Сервис для работы с категориями
 */
export class CategoryService {
  /**
   * Преобразует полную категорию в ответ с учетом языка
   */
  private mapToLocalized(category: CategoryFullResponse, lang: Language = 'ru'): CategoryResponse {
    return {
      id: category.id,
      name: lang === 'ru' ? category.nameRu : category.nameTm,
      slug: category.slug,
      description: lang === 'ru' ? category.descriptionRu : category.descriptionTm,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Получить все категории
   */
  async getAll(lang: Language = 'ru'): Promise<CategoryResponse[]> {
    const categories = await db
      .selectFrom('categories')
      .selectAll()
      .orderBy(lang === 'ru' ? 'nameRu' : 'nameTm', 'asc')
      .execute();

    return categories.map(cat => this.mapToLocalized(cat as CategoryFullResponse, lang));
  }

  /**
   * Получить категорию по slug
   */
  async getBySlug(slug: string, lang: Language = 'ru'): Promise<CategoryResponse | null> {
    const category = await db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!category) {
      return null;
    }

    return this.mapToLocalized(category as CategoryFullResponse, lang);
  }

  /**
   * Получить категорию по ID (полная версия для внутреннего использования)
   */
  async getById(id: number): Promise<CategoryFullResponse | null> {
    return await db
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst() || null;
  }

  /**
   * Получить категорию по ID с локализацией
   */
  async getByIdLocalized(id: number, lang: Language = 'ru'): Promise<CategoryResponse | null> {
    const category = await this.getById(id);
    if (!category) {
      return null;
    }
    return this.mapToLocalized(category, lang);
  }

  /**
   * Создать категорию
   */
  async create(data: CreateCategoryInput): Promise<CategoryFullResponse> {
    return await db
      .insertInto('categories')
      .values({
        nameRu: data.nameRu,
        nameTm: data.nameTm,
        slug: data.slug,
        descriptionRu: data.descriptionRu || null,
        descriptionTm: data.descriptionTm || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Обновить категорию
   */
  async update(id: number, data: UpdateCategoryInput): Promise<CategoryFullResponse> {
    // Проверяем существование категории
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Категория не найдена');
    }

    // Собираем данные для обновления
    const updateData: {
      nameRu?: string;
      nameTm?: string;
      slug?: string;
      descriptionRu?: string | null;
      descriptionTm?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };
    
    if (data.nameRu) updateData.nameRu = data.nameRu;
    if (data.nameTm) updateData.nameTm = data.nameTm;
    if (data.slug) updateData.slug = data.slug;
    if (data.descriptionRu !== undefined) updateData.descriptionRu = data.descriptionRu;
    if (data.descriptionTm !== undefined) updateData.descriptionTm = data.descriptionTm;

    return await db
      .updateTable('categories')
      .set(updateData as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Удалить категорию
   */
  async delete(id: number): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Категория не найдена');
    }

    await db
      .deleteFrom('categories')
      .where('id', '=', id)
      .execute();
  }
}

export const categoryService = new CategoryService();
