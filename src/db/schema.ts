import type { ColumnType } from 'kysely';

// Таблица пользователей
export interface User {
  id: ColumnType<number, number | undefined, never>;
  email: string;
  password: string;
  name: string;
  createdAt: ColumnType<Date, string | undefined, string>;
  updatedAt: ColumnType<Date, string | undefined, string>;
}

// Таблица категорий
export interface Category {
  id: ColumnType<number, number | undefined, never>;
  nameRu: string;
  nameTm: string;
  slug: string;
  descriptionRu: string | null;
  descriptionTm: string | null;
  createdAt: ColumnType<Date, string | undefined, string>;
  updatedAt: ColumnType<Date, string | undefined, string>;
}

// Таблица новостей
export interface News {
  id: ColumnType<number, number | undefined, never>;
  titleRu: string;
  titleTm: string;
  contentRu: string;
  contentTm: string;
  imageUrl: string | null;
  isFlash: boolean;
  categoryId: number;
  authorId: number;
  publishedAt: Date | null;
  createdAt: ColumnType<Date, string | undefined, string>;
  updatedAt: ColumnType<Date, string | undefined, string>;
}

// Главный интерфейс - описывает всю базу данных
export interface DB {
  users: User;
  categories: Category;
  news: News;
}