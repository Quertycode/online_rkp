#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для загрузки заданий из СДАМ ГИА в БД
Загружает по 20 заданий для биологии ОГЭ и математики базы ОГЭ
"""

import sys
import os
import json
import sqlite3
from pathlib import Path

# Исправляем кодировку для Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Добавляем путь к модулю sdamgia-api
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'sdamgia-api'))

from sdamgia import SdamGIA

# Пути
DB_PATH = Path(__file__).parent.parent / 'tasksbd.db'
IMAGES_DIR = Path(__file__).parent.parent / 'image_tasksdb'

# Создаем папку для изображений
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

sdamgia = SdamGIA()

def init_db_if_needed():
    """Проверяет существование БД и создает таблицы если нужно"""
    if not DB_PATH.exists():
        print("❌ База данных не найдена! Сначала создайте БД: npm run db:init")
        sys.exit(1)

def get_db_connection():
    """Возвращает подключение к БД"""
    return sqlite3.connect(str(DB_PATH))

def upsert_subject(db, code, name, exam_type='oge'):
    """Добавляет или обновляет предмет"""
    cursor = db.cursor()
    cursor.execute(
        'SELECT id FROM subjects WHERE code = ? AND exam_type = ?',
        (code, exam_type)
    )
    existing = cursor.fetchone()
    
    if existing:
        return existing[0]
    
    cursor.execute(
        'INSERT INTO subjects (code, name, exam_type) VALUES (?, ?, ?)',
        (code, name, exam_type)
    )
    db.commit()
    return cursor.lastrowid

def upsert_topic(db, subject_id, topic_number, topic_name, topic_line=None):
    """Добавляет или обновляет задание"""
    cursor = db.cursor()
    cursor.execute(
        'SELECT id FROM topics WHERE subject_id = ? AND topic_number = ?',
        (subject_id, topic_number)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            'UPDATE topics SET topic_name = ?, topic_line = ? WHERE id = ?',
            (topic_name, topic_line, existing[0])
        )
        db.commit()
        return existing[0]
    
    cursor.execute(
        'INSERT INTO topics (subject_id, topic_number, topic_name, topic_line) VALUES (?, ?, ?, ?)',
        (subject_id, topic_number, topic_name, topic_line)
    )
    db.commit()
    return cursor.lastrowid

def upsert_category(db, topic_id, category_id, category_name):
    """Добавляет или обновляет категорию"""
    cursor = db.cursor()
    cursor.execute(
        'SELECT id FROM categories WHERE topic_id = ? AND category_id = ?',
        (topic_id, category_id)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            'UPDATE categories SET category_name = ? WHERE id = ?',
            (category_name, existing[0])
        )
        db.commit()
        return existing[0]
    
    cursor.execute(
        'INSERT INTO categories (topic_id, category_id, category_name) VALUES (?, ?, ?)',
        (topic_id, category_id, category_name)
    )
    db.commit()
    return cursor.lastrowid

def download_image(url, save_path):
    """Скачивает изображение по URL"""
    import urllib.request
    try:
        urllib.request.urlretrieve(url, save_path)
        return True
    except Exception as e:
        print(f"⚠️  Ошибка загрузки изображения {url}: {e}")
        return False

def get_image_path(subject_code, problem_id, image_type, image_index, image_url):
    """Возвращает путь для сохранения изображения"""
    subject_dir = IMAGES_DIR / subject_code / problem_id
    subject_dir.mkdir(parents=True, exist_ok=True)
    
    # Определяем расширение из URL
    ext = os.path.splitext(image_url.split('?')[0])[1] or '.png'
    filename = f"{image_type}_{image_index}{ext}"
    
    return subject_dir / filename

def format_text_with_images(text, images):
    """Форматирует текст с изображениями"""
    if not images:
        return text
    
    result = text
    if result and not result.endswith('\n'):
        result += '\n\n'
    
    for i, img_path in enumerate(images, 1):
        # Относительный путь от папки server
        rel_path = str(img_path.relative_to(DB_PATH.parent)).replace('\\', '/')
        result += f'\n![Изображение {i}]({rel_path})\n'
    
    return result

def upsert_problem(db, subject_id, topic_id, problem_id, line, condition_text, 
                   solution_text, answer, url):
    """Добавляет или обновляет задачу"""
    cursor = db.cursor()
    cursor.execute(
        'SELECT id FROM problems WHERE subject_id = ? AND problem_id = ?',
        (subject_id, problem_id)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            '''UPDATE problems 
               SET topic_id = ?, line = ?, condition_text = ?, solution_text = ?, 
                   answer = ?, url = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?''',
            (topic_id, line, condition_text, solution_text, answer, url, existing[0])
        )
        db.commit()
        return existing[0]
    
    cursor.execute(
        '''INSERT INTO problems 
           (subject_id, topic_id, problem_id, line, condition_text, solution_text, answer, url, source)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sdamgia')''',
        (subject_id, topic_id, problem_id, line, condition_text, solution_text, answer, url)
    )
    db.commit()
    return cursor.lastrowid

def insert_images(db, problem_id, images, image_type):
    """Сохраняет изображения в БД"""
    cursor = db.cursor()
    table = 'problem_condition_images' if image_type == 'condition' else 'problem_solution_images'
    cursor.execute(f'DELETE FROM {table} WHERE problem_id = ?', (problem_id,))
    
    for index, (url, path) in enumerate(images):
        cursor.execute(
            f'INSERT INTO {table} (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)',
            (problem_id, url, str(path.relative_to(DB_PATH.parent)).replace('\\', '/'), index)
        )
    db.commit()

def link_problem_to_categories(db, problem_id, topic_id):
    """Связывает задачу со всеми категориями из topic"""
    if not topic_id:
        return
    
    cursor = db.cursor()
    cursor.execute('SELECT id FROM categories WHERE topic_id = ?', (topic_id,))
    categories = cursor.fetchall()
    
    for category_id, in categories:
        cursor.execute(
            'INSERT OR IGNORE INTO category_problems (category_id, problem_id) VALUES (?, ?)',
            (category_id, problem_id)
        )
    db.commit()

def load_catalog(db, subject_code, subject_name, exam_type='oge'):
    """Загружает каталог предмета"""
    print(f'📚 Загружаем каталог для {subject_name}...')
    
    try:
        catalog = sdamgia.get_catalog(subject_code)
        subject_id = upsert_subject(db, subject_code, subject_name, exam_type)
        
        for topic in catalog:
            topic_id = upsert_topic(
                db, subject_id, topic['topic_id'], topic['topic_name'],
                topic.get('topic_line')
            )
            
            for category in topic.get('categories', []):
                upsert_category(db, topic_id, category['category_id'], category['category_name'])
        
        print(f'✅ Каталог для {subject_name} загружен')
    except Exception as e:
        print(f'❌ Ошибка загрузки каталога {subject_name}: {e}')

def get_problem_ids(subject_code, count=20):
    """Получает список ID задач для загрузки"""
    catalog = sdamgia.get_catalog(subject_code)
    problem_ids = []
    
    for topic in catalog[:5]:  # Первые 5 заданий
        if len(problem_ids) >= count:
            break
        
        for category in topic.get('categories', [])[:2]:  # По 2 категории
            if len(problem_ids) >= count:
                break
            
            try:
                category_problems = sdamgia.get_category_by_id(
                    subject_code, category['category_id'], 1
                )
                to_add = min(4, count - len(problem_ids), len(category_problems))
                problem_ids.extend(category_problems[:to_add])
            except Exception as e:
                print(f'⚠️  Не удалось получить задачи из категории {category["category_id"]}: {e}')
    
    return problem_ids[:count]

def import_problem(db, subject_code, subject_name, problem_id, exam_type='oge'):
    """Импортирует задачу"""
    try:
        print(f'📥 Загружаем задачу {problem_id} ({subject_code})...')
        
        problem_data = sdamgia.get_problem_by_id(subject_code, problem_id)
        
        if not problem_data:
            print(f'⚠️  Задача {problem_id} не найдена')
            return
        
        subject_id = upsert_subject(db, subject_code, subject_name, exam_type)
        
        # Получаем информацию о topic
        topic_id = None
        line = None
        
        if problem_data.get('topic'):
            try:
                catalog = sdamgia.get_catalog(subject_code)
                topic_info = next((t for t in catalog if t['topic_id'] == problem_data['topic']), None)
                
                if topic_info:
                    topic_id = upsert_topic(
                        db, subject_id, problem_data['topic'], topic_info['topic_name'],
                        topic_info.get('topic_line')
                    )
                    line = topic_info.get('topic_line')
                else:
                    topic_id = upsert_topic(db, subject_id, problem_data['topic'], f'Задание {problem_data["topic"]}')
            except:
                topic_id = upsert_topic(db, subject_id, problem_data['topic'], f'Задание {problem_data["topic"]}')
        
        # Скачиваем изображения условий
        condition_images = []
        condition_image_paths = []
        if problem_data.get('condition', {}).get('images'):
            for i, url in enumerate(problem_data['condition']['images']):
                img_path = get_image_path(subject_code, problem_id, 'condition', i, url)
                if download_image(url, str(img_path)):
                    condition_images.append((url, img_path))
                    condition_image_paths.append(img_path)
        
        # Скачиваем изображения решений
        solution_images = []
        solution_image_paths = []
        if problem_data.get('solution', {}).get('images'):
            for i, url in enumerate(problem_data['solution']['images']):
                img_path = get_image_path(subject_code, problem_id, 'solution', i, url)
                if download_image(url, str(img_path)):
                    solution_images.append((url, img_path))
                    solution_image_paths.append(img_path)
        
        # Форматируем текст с изображениями
        condition_text = format_text_with_images(
            problem_data.get('condition', {}).get('text', ''),
            condition_image_paths
        )
        solution_text = format_text_with_images(
            problem_data.get('solution', {}).get('text', ''),
            solution_image_paths
        )
        
        # Сохраняем задачу
        db_problem_id = upsert_problem(
            db, subject_id, topic_id, problem_id, line,
            condition_text, solution_text,
            problem_data.get('answer', ''),
            problem_data.get('url', '')
        )
        
        # Сохраняем изображения
        if condition_images:
            insert_images(db, db_problem_id, condition_images, 'condition')
        if solution_images:
            insert_images(db, db_problem_id, solution_images, 'solution')
        
        # Связываем с категориями
        if topic_id:
            link_problem_to_categories(db, db_problem_id, topic_id)
        
        # Сохраняем аналогичные задачи (если они уже есть в БД)
        if problem_data.get('analogs'):
            cursor = db.cursor()
            for analog_id in problem_data['analogs']:
                cursor.execute(
                    '''INSERT OR IGNORE INTO problem_analogs (problem_id, analog_problem_id)
                       SELECT ?, p.id FROM problems p
                       WHERE p.subject_id = ? AND p.problem_id = ?''',
                    (db_problem_id, subject_id, analog_id)
                )
            db.commit()
        
        print(f'✅ Задача {problem_id} успешно импортирована')
        
    except Exception as e:
        print(f'❌ Ошибка при импорте задачи {problem_id}: {e}')
        import traceback
        traceback.print_exc()

def main():
    """Основная функция"""
    print('🚀 Начинаем загрузку заданий в БД...\n')
    
    init_db_if_needed()
    db = get_db_connection()
    
    try:
        # 1. Загружаем каталоги
        load_catalog(db, 'bio', 'Биология', 'oge')
        load_catalog(db, 'mathb', 'Математика база', 'oge')
        print()
        
        # 2. Загружаем задачи по биологии
        print('🔬 Загружаем задачи по биологии ОГЭ (20 заданий)...')
        bio_problem_ids = get_problem_ids('bio', 20)
        print(f'Найдено {len(bio_problem_ids)} задач для загрузки\n')
        
        for problem_id in bio_problem_ids:
            import_problem(db, 'bio', 'Биология', problem_id, 'oge')
        print()
        
        # 3. Загружаем задачи по математике базе
        print('🔢 Загружаем задачи по математике базе ОГЭ (20 заданий)...')
        mathb_problem_ids = get_problem_ids('mathb', 20)
        print(f'Найдено {len(mathb_problem_ids)} задач для загрузки\n')
        
        for problem_id in mathb_problem_ids:
            import_problem(db, 'mathb', 'Математика база', problem_id, 'oge')
        print()
        
        # 4. Статистика
        cursor = db.cursor()
        cursor.execute(
            'SELECT COUNT(*) FROM problems p JOIN subjects s ON p.subject_id = s.id WHERE s.code = ? AND s.exam_type = ?',
            ('bio', 'oge')
        )
        bio_count = cursor.fetchone()[0]
        
        cursor.execute(
            'SELECT COUNT(*) FROM problems p JOIN subjects s ON p.subject_id = s.id WHERE s.code = ? AND s.exam_type = ?',
            ('mathb', 'oge')
        )
        mathb_count = cursor.fetchone()[0]
        
        print('\n📊 Статистика загрузки:')
        print(f'   Биология ОГЭ: {bio_count} задач')
        print(f'   Математика база ОГЭ: {mathb_count} задач')
        print(f'   Всего: {bio_count + mathb_count} задач')
        
    except Exception as e:
        print(f'❌ Критическая ошибка: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == '__main__':
    main()

