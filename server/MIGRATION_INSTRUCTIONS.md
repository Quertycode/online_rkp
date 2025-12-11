# Инструкции по миграции БД

## Шаги для применения изменений

1. **Перейдите в директорию server:**
```bash
cd server
```

2. **Создайте миграцию Prisma:**
```bash
npx prisma migrate dev --name add_grade_and_directions
```

3. **Запустите seed для добавления предметов:**
```bash
npm run prisma:seed
```

4. **Сгенерируйте Prisma Client:**
```bash
npx prisma generate
```

## Что было добавлено

### Модели БД:
- **Direction** - модель предметов (направлений обучения)
  - Поля: id, name, examType (OGE/EGE)
  
- **UserDirection** - связь many-to-many между пользователями и предметами
  - Связывает User и Direction

### Изменения в User:
- Добавлено поле `grade` (Int?) - класс обучения (8-11)
- Добавлена связь `directions` (UserDirection[])

### Предметы по умолчанию:
- Математика (профильная) - ЕГЭ
- Математика (базовая) - ЕГЭ  
- Биология - ЕГЭ
- Русский язык - ЕГЭ
- История - ЕГЭ
- Английский язык - ЕГЭ

## API Endpoints

### Directions:
- `GET /directions` - получить все предметы
- `GET /directions/:id` - получить предмет по ID
- `GET /directions/exam-type/:type` - получить предметы по типу экзамена (OGE/EGE)

### Auth (обновлено):
- `POST /auth/register` - теперь принимает дополнительные поля:
  - `grade` (number, required) - класс 8-11
  - `directionIds` (string[], required) - массив ID выбранных предметов


