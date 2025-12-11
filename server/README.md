# EduMVP Backend

Backend сервер для платформы онлайн-обучения на NestJS + Prisma + PostgreSQL.

## Установка

\`\`\`bash
npm install
\`\`\`

## Настройка базы данных

1. Создайте файл `.env` в корне папки `server`
2. Укажите DATABASE_URL в .env файле:

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/edumvp
\`\`\`

3. Примените миграции:

\`\`\`bash
npx prisma migrate dev
\`\`\`

4. Сгенерируйте Prisma Client:

\`\`\`bash
npx prisma generate
\`\`\`

## Запуск

\`\`\`bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
\`\`\`

## API Endpoints

### Auth
- \`POST /auth/register\` - Регистрация
- \`POST /auth/login\` - Вход
- \`POST /auth/profile\` - Получить профиль (требует JWT)

### Users
- \`GET /users\` - Получить всех пользователей
- \`GET /users/:id\` - Получить пользователя
- \`PUT /users/:id\` - Обновить пользователя
- \`DELETE /users/:id\` - Удалить пользователя

### Courses
- \`GET /courses\` - Получить все курсы
- \`GET /courses/:id\` - Получить курс
- \`GET /courses/subject/:subject\` - Получить курс по предмету

## Миграции

\`\`\`bash
# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции
npx prisma migrate deploy

# Откатить миграцию
npx prisma migrate reset
\`\`\`

## Prisma Studio

Для визуального просмотра базы данных:

\`\`\`bash
npx prisma studio
\`\`\`

