# News Portal API

Backend API для новостного портала на Express.js + TypeScript + PostgreSQL.

## Технологии

- **Express.js** - веб-фреймворк
- **TypeScript** - типизированный JavaScript
- **PostgreSQL** - реляционная база данных
- **Kysely** - type-safe SQL query builder
- **Zod** - валидация данных
- **JWT** - авторизация
- **bcrypt** - хеширование паролей
- **Docker** - контейнеризация базы данных

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Запустите базу данных (Docker):
```bash
npm run db:up
```

4. Запустите миграции:
```bash
npm run migrate
```

5. (Опционально) Заполните базу тестовыми данными:
```bash
npm run seed
```

6. Запустите сервер:
```bash
npm run dev
```

## API Endpoints

### Авторизация

#### Регистрация
```
POST /api/auth/register
Body: { email, password, name }
Response: { user, token }
```

#### Вход
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

#### Получить текущего пользователя
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### Категории

#### Получить все категории
```
GET /api/categories
Response: { categories: [...] }
```

#### Получить категорию по slug
```
GET /api/categories/:slug
Response: { category }
```

#### Создать категорию (требует авторизации)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Body: { name, slug, description? }
Response: { category }
```

#### Обновить категорию (требует авторизации)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
Body: { name?, slug?, description? }
Response: { category }
```

#### Удалить категорию (требует авторизации)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Новости

#### Получить все новости
```
GET /api/news?page=1&limit=10&categoryId=1&sortBy=publishedAt&sortOrder=desc&startDate=2024-01-01&endDate=2024-12-31
Query параметры:
  - page (number) - номер страницы (по умолчанию: 1)
  - limit (number) - количество на странице (по умолчанию: 10)
  - categoryId (number) - фильтр по категории
  - sortBy (string) - поле для сортировки (publishedAt, createdAt, title)
  - sortOrder (string) - порядок сортировки (asc, desc)
  - startDate (string) - начальная дата (YYYY-MM-DD)
  - endDate (string) - конечная дата (YYYY-MM-DD)
Response: { news: [...], pagination: {...}, sort: {...} }
```

#### Поиск новостей
```
GET /api/news/search?q=запрос&page=1&limit=10
Query параметры:
  - q (string) - поисковый запрос (обязательно)
  - page (number) - номер страницы
  - limit (number) - количество на странице
Response: { query, news: [...], pagination: {...} }
```

#### Получить новости по категории
```
GET /api/news/category/:slug?page=1&limit=10
Response: { category: {...}, news: [...], pagination: {...} }
```

#### Получить новость по ID
```
GET /api/news/:id
Response: { news }
```

#### Создать новость (требует авторизации)
```
POST /api/news
Headers: Authorization: Bearer <token>
Body: { title, content, categoryId }
Response: { news }
```

#### Обновить новость (только автор)
```
PUT /api/news/:id
Headers: Authorization: Bearer <token>
Body: { title?, content?, categoryId? }
Response: { news }
```

#### Удалить новость (только автор)
```
DELETE /api/news/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

## Структура проекта

```
src/
├── config/          # Конфигурация (БД)
├── db/              # Схема БД и миграции
├── middleware/      # Middleware (auth, errorHandler, logger, validateParams)
├── routes/          # Роуты API
├── types/           # TypeScript типы и схемы валидации
├── utils/           # Утилиты (password, response)
└── index.ts         # Точка входа
```

## Команды

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск собранного проекта
- `npm run migrate` - запуск миграций БД
- `npm run seed` - заполнение БД тестовыми данными
- `npm run db:up` - запуск БД (Docker)
- `npm run db:down` - остановка БД
- `npm run db:logs` - просмотр логов БД

## Особенности

- ✅ Централизованная обработка ошибок
- ✅ Валидация данных через Zod
- ✅ JWT авторизация
- ✅ Хеширование паролей (bcrypt)
- ✅ Логирование запросов
- ✅ Пагинация и сортировка
- ✅ Поиск по новостям
- ✅ Фильтрация по дате и категории
- ✅ Type-safe запросы к БД (Kysely)

## Тестовые данные

После запуска `npm run seed` в базе будут созданы:

- **4 пользователя** (все с паролем `password123`):
  - admin@example.com
  - editor@example.com
  - author@example.com
  - user@example.com

- **6 категорий**:
  - Технологии (tech)
  - Наука (science)
  - Спорт (sport)
  - Политика (politics)
  - Экономика (economy)
  - Культура (culture)

- **12 новостей** в разных категориях

## Примеры использования

### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Создание новости
```bash
curl -X POST http://localhost:3000/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Новая новость","content":"Текст новости","categoryId":1}'
```

### Получение новостей с фильтрами
```bash
curl "http://localhost:3000/api/news?page=1&limit=10&sortBy=publishedAt&sortOrder=desc"
```

## Разработка

Проект использует TypeScript для типобезопасности. Все типы генерируются автоматически из схем Zod и схемы базы данных.

## Лицензия

MIT
