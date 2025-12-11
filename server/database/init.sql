-- Инициализация базы данных для заданий СДАМ ГИА
-- SQLite схема

-- Таблица предметов
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,              -- Код предмета (math, rus, bio и т.д.)
    name TEXT NOT NULL,                     -- Название предмета (Математика, Русский язык)
    exam_type TEXT NOT NULL DEFAULT 'oge',  -- Тип экзамена: 'oge' или 'ege'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_exam_type ON subjects(exam_type);

-- Таблица тем/заданий
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,            -- Связь с предметом
    topic_number TEXT NOT NULL,             -- Номер задания (может быть "1", "Д1", "C4")
    topic_name TEXT NOT NULL,               -- Название задания
    topic_line TEXT,                        -- Линия заданий (если есть)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(subject_id, topic_number)
);

CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_topic_number ON topics(topic_number);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,              -- Связь с заданием
    category_id TEXT NOT NULL,               -- ID категории из СДАМ ГИА
    category_name TEXT NOT NULL,             -- Название категории
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(topic_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_topic_id ON categories(topic_id);
CREATE INDEX IF NOT EXISTS idx_categories_category_id ON categories(category_id);

-- Таблица задач
CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,            -- Связь с предметом
    topic_id INTEGER,                       -- Связь с заданием (может быть NULL)
    problem_id TEXT NOT NULL,               -- ID задачи из СДАМ ГИА
    line TEXT,                              -- Линия заданий (например, "1", "2", "3")
    condition_text TEXT,                    -- Текст условия задачи
    solution_text TEXT,                      -- Текст решения задачи
    answer TEXT,                             -- Ответ на задачу
    url TEXT,                                -- URL задачи на сайте СДАМ ГИА
    source TEXT DEFAULT 'sdamgia',          -- Источник данных (sdamgia, manual и т.д.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    UNIQUE(subject_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_problems_subject_id ON problems(subject_id);
CREATE INDEX IF NOT EXISTS idx_problems_topic_id ON problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_problems_problem_id ON problems(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_source ON problems(source);
CREATE INDEX IF NOT EXISTS idx_problems_line ON problems(line);

-- Таблица изображений условий
CREATE TABLE IF NOT EXISTS problem_condition_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,           -- Связь с задачей
    image_url TEXT,                        -- Оригинальный URL изображения (для справки)
    image_path TEXT NOT NULL,              -- Локальный путь к изображению
    image_order INTEGER DEFAULT 0,          -- Порядок изображения в условии
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_condition_images_problem_id ON problem_condition_images(problem_id);

-- Таблица изображений решений
CREATE TABLE IF NOT EXISTS problem_solution_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,           -- Связь с задачей
    image_url TEXT,                        -- Оригинальный URL изображения (для справки)
    image_path TEXT NOT NULL,              -- Локальный путь к изображению
    image_order INTEGER DEFAULT 0,          -- Порядок изображения в решении
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solution_images_problem_id ON problem_solution_images(problem_id);

-- Таблица связи категорий и задач
CREATE TABLE IF NOT EXISTS category_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,           -- Связь с категорией
    problem_id INTEGER NOT NULL,            -- Связь с задачей
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(category_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_category_problems_category_id ON category_problems(category_id);
CREATE INDEX IF NOT EXISTS idx_category_problems_problem_id ON category_problems(problem_id);

-- Таблица аналогичных задач
CREATE TABLE IF NOT EXISTS problem_analogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,           -- Основная задача
    analog_problem_id INTEGER NOT NULL,    -- Аналогичная задача
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (analog_problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(problem_id, analog_problem_id),
    CHECK(problem_id != analog_problem_id)  -- Задача не может быть аналогичной самой себе
);

CREATE INDEX IF NOT EXISTS idx_problem_analogs_problem_id ON problem_analogs(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_analogs_analog_id ON problem_analogs(analog_problem_id);

-- Таблица тестов
CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,            -- Связь с предметом
    test_id TEXT NOT NULL,                  -- ID теста из СДАМ ГИА
    test_name TEXT,                         -- Название теста (если есть)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(subject_id, test_id)
);

-- Таблица связи тестов и задач
CREATE TABLE IF NOT EXISTS test_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,               -- Связь с тестом
    problem_id INTEGER NOT NULL,            -- Связь с задачей
    problem_order INTEGER DEFAULT 0,        -- Порядок задачи в тесте
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(test_id, problem_id, problem_order)
);

CREATE INDEX IF NOT EXISTS idx_test_problems_test_id ON test_problems(test_id);
CREATE INDEX IF NOT EXISTS idx_test_problems_problem_id ON test_problems(problem_id);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER IF NOT EXISTS update_subjects_timestamp 
    AFTER UPDATE ON subjects
    FOR EACH ROW
BEGIN
    UPDATE subjects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_topics_timestamp 
    AFTER UPDATE ON topics
    FOR EACH ROW
BEGIN
    UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
    AFTER UPDATE ON categories
    FOR EACH ROW
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_problems_timestamp 
    AFTER UPDATE ON problems
    FOR EACH ROW
BEGIN
    UPDATE problems SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tests_timestamp 
    AFTER UPDATE ON tests
    FOR EACH ROW
BEGIN
    UPDATE tests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;


