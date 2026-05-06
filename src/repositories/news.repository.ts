import { db } from '../config/database';
import { NewsQueryInput } from '../types/schemas';

export const newsRepository = {
  expireOldFlashNews(cutoff: Date) {
    return db
      .updateTable('news')
      .set({ isFlash: false })
      .where('isFlash', '=', true)
      .where('publishedAt', 'is not', null)
      .where('publishedAt', '<=', cutoff)
      .execute();
  },

  getBaseNewsQuery() {
    return db
      .selectFrom('news')
      .innerJoin('categories', 'news.categoryId', 'categories.id')
      .innerJoin('users', 'news.authorId', 'users.id')
      .select([
        'news.id',
        'news.titleRu',
        'news.titleTm',
        'news.titleEn',
        'news.contentRu',
        'news.contentTm',
        'news.contentEn',
        'news.imageUrl',
        'news.isFlash',
        'news.publishedAt',
        'news.createdAt',
        'news.updatedAt',
        'categories.id as categoryId',
        'categories.nameRu as categoryNameRu',
        'categories.nameTm as categoryNameTm',
        'categories.nameEn as categoryNameEn',
        'categories.slug as categorySlug',
        'users.id as authorId',
        'users.name as authorName',
        'users.email as authorEmail',
      ]);
  },

  countPublishedWithFilters(query: NewsQueryInput) {
    let totalQuery = db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('news.publishedAt', 'is not', null);

    if (query.categoryId) totalQuery = totalQuery.where('news.categoryId', '=', query.categoryId);
    if (query.isFlash !== undefined) totalQuery = totalQuery.where('news.isFlash', '=', query.isFlash);
    if (query.startDate) totalQuery = totalQuery.where('news.publishedAt', '>=', new Date(query.startDate));
    if (query.endDate) totalQuery = totalQuery.where('news.publishedAt', '<=', new Date(query.endDate));

    return totalQuery.executeTakeFirst();
  },

  findCategoryBySlug(slug: string) {
    return db.selectFrom('categories').selectAll().where('slug', '=', slug).executeTakeFirst();
  },

  countPublishedByCategory(categoryId: number) {
    return db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('categoryId', '=', categoryId)
      .where('publishedAt', 'is not', null)
      .executeTakeFirst();
  },

  countSearchPublished(titleField: string, contentField: string, searchQuery: string) {
    return db
      .selectFrom('news')
      .select(({ fn }) => fn.count('news.id').as('total'))
      .where('publishedAt', 'is not', null)
      .where((eb) =>
        eb.or([
          eb(titleField as any, 'ilike', `%${searchQuery}%`),
          eb(contentField as any, 'ilike', `%${searchQuery}%`),
        ])
      )
      .executeTakeFirst();
  },

  findById(id: number) {
    return db.selectFrom('news').selectAll().where('id', '=', id).executeTakeFirst();
  },

  create(values: {
    titleRu: string;
    titleTm: string;
    titleEn: string;
    contentRu: string;
    contentTm: string;
    contentEn: string;
    imageUrl: string | null;
    isFlash: boolean;
    categoryId: number;
    authorId: number;
    publishedAt: Date;
  }) {
    return db.insertInto('news').values(values).returningAll().executeTakeFirstOrThrow();
  },

  update(
    id: number,
    updateData: {
      titleRu?: string;
      titleTm?: string;
      titleEn?: string;
      contentRu?: string;
      contentTm?: string;
      contentEn?: string;
      imageUrl?: string | null;
      isFlash?: boolean;
      categoryId?: number;
      updatedAt: Date;
    }
  ) {
    return db
      .updateTable('news')
      .set(updateData as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  delete(id: number) {
    return db.deleteFrom('news').where('id', '=', id).execute();
  },
};
