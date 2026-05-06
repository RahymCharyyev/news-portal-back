import { CreateCategoryInput, UpdateCategoryInput, Language } from '../types/schemas';
import { categoriesRepository } from '../repositories/categories.repository';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CategoryFullResponse {
  id: number;
  nameRu: string;
  nameTm: string;
  nameEn: string;
  slug: string;
  descriptionRu: string | null;
  descriptionTm: string | null;
  descriptionEn: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function mapToLocalized(category: CategoryFullResponse, lang: Language = 'ru'): CategoryResponse {
  const nameByLang: Record<Language, string> = {
    ru: category.nameRu,
    tm: category.nameTm,
    en: category.nameEn,
  };
  const descriptionByLang: Record<Language, string | null> = {
    ru: category.descriptionRu,
    tm: category.descriptionTm,
    en: category.descriptionEn,
  };
  return {
    id: category.id,
    name: nameByLang[lang],
    slug: category.slug,
    description: descriptionByLang[lang],
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

  /**
   * Получить все категории
   */
async function getAll(lang: Language = 'ru'): Promise<CategoryResponse[]> {
  const orderColumn = lang === 'ru' ? 'nameRu' : lang === 'tm' ? 'nameTm' : 'nameEn';
  const categories = await categoriesRepository.getAll(orderColumn);

  return categories.map(cat => mapToLocalized(cat as CategoryFullResponse, lang));
}

  /**
   * Получить категорию по slug
   */
async function getBySlug(slug: string, lang: Language = 'ru'): Promise<CategoryResponse | null> {
  const category = await categoriesRepository.getBySlug(slug);

    if (!category) {
      return null;
    }

  return mapToLocalized(category as CategoryFullResponse, lang);
}

  /**
   * Получить категорию по ID (полная версия для внутреннего использования)
   */
async function getById(id: number): Promise<CategoryFullResponse | null> {
  return (await categoriesRepository.getById(id)) || null;
}

  /**
   * Получить категорию по ID с локализацией
   */
async function getByIdLocalized(id: number, lang: Language = 'ru'): Promise<CategoryResponse | null> {
  const category = await getById(id);
  if (!category) {
    return null;
  }
  return mapToLocalized(category, lang);
}

  /**
   * Создать категорию
   */
async function create(data: CreateCategoryInput): Promise<CategoryFullResponse> {
  return await categoriesRepository.create({
    nameRu: data.nameRu,
    nameTm: data.nameTm,
    nameEn: data.nameEn,
    slug: data.slug,
    descriptionRu: data.descriptionRu || null,
    descriptionTm: data.descriptionTm || null,
    descriptionEn: data.descriptionEn || null,
  });
}

  /**
   * Обновить категорию
   */
async function update(id: number, data: UpdateCategoryInput): Promise<CategoryFullResponse> {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Категория не найдена');
  }

    // Собираем данные для обновления
  const updateData: {
    nameRu?: string;
    nameTm?: string;
    nameEn?: string;
    slug?: string;
    descriptionRu?: string | null;
    descriptionTm?: string | null;
    descriptionEn?: string | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (data.nameRu) updateData.nameRu = data.nameRu;
  if (data.nameTm) updateData.nameTm = data.nameTm;
  if (data.nameEn) updateData.nameEn = data.nameEn;
  if (data.slug) updateData.slug = data.slug;
  if (data.descriptionRu !== undefined) updateData.descriptionRu = data.descriptionRu;
  if (data.descriptionTm !== undefined) updateData.descriptionTm = data.descriptionTm;
  if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;

  return await categoriesRepository.update(id, updateData);
}

  /**
   * Удалить категорию
   */
async function remove(id: number): Promise<void> {
  const existing = await getById(id);
  if (!existing) {
    throw new Error('Категория не найдена');
  }

  await categoriesRepository.delete(id);
}

export const categoryService = {
  getAll,
  getBySlug,
  getById,
  getByIdLocalized,
  create,
  update,
  delete: remove,
};
