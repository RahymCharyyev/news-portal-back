/**
 * Константы приложения
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const VALID_SORT_FIELDS = ['publishedAt', 'createdAt', 'titleRu', 'titleTm'] as const;
export const VALID_SORT_ORDERS = ['asc', 'desc'] as const;

export type SortField = typeof VALID_SORT_FIELDS[number];
export type SortOrder = typeof VALID_SORT_ORDERS[number];
