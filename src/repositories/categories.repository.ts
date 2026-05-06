import { db } from '../config/database';

export const categoriesRepository = {
  getAll(orderColumn: 'nameRu' | 'nameTm' | 'nameEn') {
    return db.selectFrom('categories').selectAll().orderBy(orderColumn, 'asc').execute();
  },

  getBySlug(slug: string) {
    return db.selectFrom('categories').selectAll().where('slug', '=', slug).executeTakeFirst();
  },

  getById(id: number) {
    return db.selectFrom('categories').selectAll().where('id', '=', id).executeTakeFirst();
  },

  create(values: {
    nameRu: string;
    nameTm: string;
    nameEn: string;
    slug: string;
    descriptionRu: string | null;
    descriptionTm: string | null;
    descriptionEn: string | null;
  }) {
    return db.insertInto('categories').values(values).returningAll().executeTakeFirstOrThrow();
  },

  update(
    id: number,
    values: {
      nameRu?: string;
      nameTm?: string;
      nameEn?: string;
      slug?: string;
      descriptionRu?: string | null;
      descriptionTm?: string | null;
      descriptionEn?: string | null;
      updatedAt: Date;
    }
  ) {
    return db
      .updateTable('categories')
      .set(values as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  delete(id: number) {
    return db.deleteFrom('categories').where('id', '=', id).execute();
  },
};
