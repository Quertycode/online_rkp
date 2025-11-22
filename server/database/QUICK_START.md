# 🚀 Быстрый старт - Банк заданий СДАМ ГИА

## Шаг 1: Создание базы данных

```bash
cd server
npx ts-node database/init-db.ts
```

Или напрямую через SQLite:

```bash
cd server
sqlite3 tasksbd.db < database/schema.sql
```

## Шаг 2: Структура БД

База данных содержит следующие основные таблицы:

- **subjects** - Предметы (математика, русский язык и т.д.)
- **topics** - Задания (номер задания, название)
- **categories** - Категории внутри заданий
- **problems** - Задачи (основная таблица)
- **problem_condition_images** - Изображения из условий
- **problem_solution_images** - Изображения из решений
- **problem_analogs** - Аналогичные задачи
- **tests** - Тесты
- **test_problems** - Задачи в тестах

## Шаг 3: Загрузка данных

Используйте пример скрипта `example-import.ts` для загрузки данных из СДАМ ГИА API:

```typescript
import { importProblem, importCatalog } from './database/example-import'
import { SdamGIA } from '../../sdamgia-api/sdamgia/__init__'

const sdamgia = new SdamGIA()
const db = new Database('tasksbd.db')

// Импорт каталога
await importCatalog(db, sdamgia, 'math', 'Математика', 'oge')

// Импорт задачи
await importProblem(db, sdamgia, 'math', 'Математика', '1001', 'oge')
```

## Шаг 4: Использование в сервисе

Обновите `TasksService` для работы с новой структурой БД:

```typescript
// Пример запроса задачи с изображениями
const query = `
  SELECT 
    p.*,
    GROUP_CONCAT(pci.image_url) as condition_images,
    GROUP_CONCAT(psi.image_url) as solution_images
  FROM problems p
  LEFT JOIN problem_condition_images pci ON p.id = pci.problem_id
  LEFT JOIN problem_solution_images psi ON p.id = psi.problem_id
  WHERE p.problem_id = ? AND p.subject_id = ?
  GROUP BY p.id
`
```

## Поддерживаемые предметы

- `math` - Математика
- `rus` - Русский язык
- `bio` - Биология
- `phys` - Физика
- `chem` - Химия
- `inf` - Информатика
- `geo` - География
- `soc` - Обществознание
- `hist` - История
- `lit` - Литература
- `en` - Английский язык
- И другие...

## Типы экзаменов

- `oge` - Основной государственный экзамен (9 класс)
- `ege` - Единый государственный экзамен (11 класс)

## Полезные команды

```bash
# Просмотр структуры БД
sqlite3 tasksbd.db ".schema"

# Подсчет задач
sqlite3 tasksbd.db "SELECT COUNT(*) FROM problems"

# Просмотр предметов
sqlite3 tasksbd.db "SELECT * FROM subjects"

# Резервное копирование
sqlite3 tasksbd.db ".backup backup.db"
```

## Документация

Подробная документация: [README.md](./README.md)

