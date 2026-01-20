import { z } from 'zod';

// Схема для создания категории
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название слишком длинное'),
  slug: z.string().min(1, 'Slug обязателен').max(255, 'Slug слишком длинный'),
  description: z.string().optional(),
});

// Схема для обновления категории (все поля опциональны)
export const updateCategorySchema = createCategorySchema.partial();

// Схема для создания новости
export const createNewsSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(500, 'Заголовок слишком длинный'),
  content: z.string().min(1, 'Содержание обязательно'),
  categoryId: z.number().int().positive('ID категории должен быть положительным числом'),
  authorId: z.number().int().positive('ID автора должен быть положительным числом').optional(),
});

// Схема для обновления новости (все поля опциональны)
export const updateNewsSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(500, 'Заголовок слишком длинный').optional(),
  content: z.string().min(1, 'Содержание обязательно').optional(),
  categoryId: z.number().int().positive('ID категории должен быть положительным числом').optional(),
});

// Схема для регистрации пользователя
export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
  name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
});

// Схема для входа
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// Схема для поиска
export const searchSchema = z.object({
  q: z.string().min(1, 'Поисковый запрос обязателен'),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

// Схема для query параметров новостей
export const newsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  categoryId: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  sortBy: z.enum(['publishedAt', 'createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// TypeScript типы из схем
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;