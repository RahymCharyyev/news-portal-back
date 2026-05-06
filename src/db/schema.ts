import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Categories {
  createdAt: Generated<Timestamp | null>;
  descriptionEn: string | null;
  descriptionRu: string | null;
  descriptionTm: string | null;
  id: Generated<number>;
  nameEn: string;
  nameRu: string;
  nameTm: string;
  slug: string;
  updatedAt: Generated<Timestamp | null>;
}

export interface News {
  authorId: number | null;
  categoryId: number | null;
  contentEn: string;
  contentRu: string;
  contentTm: string;
  createdAt: Generated<Timestamp | null>;
  id: Generated<number>;
  imageUrl: string | null;
  isFlash: Generated<boolean | null>;
  publishedAt: Timestamp | null;
  titleEn: string;
  titleRu: string;
  titleTm: string;
  updatedAt: Generated<Timestamp | null>;
}

export interface Users {
  createdAt: Generated<Timestamp | null>;
  email: string;
  id: Generated<number>;
  isBlocked: Generated<boolean>;
  name: string;
  password: string;
  role: 'admin' | 'user';
  updatedAt: Generated<Timestamp | null>;
}

export interface DB {
  categories: Categories;
  news: News;
  users: Users;
}
