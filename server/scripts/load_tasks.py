# -*- coding: utf-8 -*-
"""
Скрипт для загрузки заданий из СДАМ ГИА в базу данных

Использование:
    python load_tasks.py --subject mathb --exam-type oge --count 30
    python load_tasks.py --subject bio --exam-type oge --count 30
    
    # Загрузить все задания из категории
    python load_tasks.py --subject mathb --exam-type oge --category 174 --count 50
"""

import sys
import os
import sqlite3
import requests
import argparse
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
import time

# Добавляем путь к sdamgia-api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../sdamgia-api'))

from sdamgia import SdamGIA


class TasksLoader:
    def __init__(self, db_path: str, images_dir: str):
        self.db_path = db_path
        self.images_dir = Path(images_dir)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.sdamgia = SdamGIA()
        self.conn = None
        
        # Маппинг предметов
        self.subject_names = {
            'math': 'Математика (Профиль)',
            'mathb': 'Математика (База)',
            'rus': 'Русский язык',
            'bio': 'Биология',
            'phys': 'Физика',
            'chem': 'Химия',
            'inf': 'Информатика',
            'geo': 'География',
            'soc': 'Обществознание',
            'hist': 'История',
            'lit': 'Литература',
            'en': 'Английский язык',
            'de': 'Немецкий язык',
            'fr': 'Французский язык',
            'sp': 'Испанский язык',
        }
    
    def connect(self):
        """Подключение к базе данных"""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        print(f"OK Подключено к БД: {self.db_path}")
    
    def close(self):
        """Закрытие соединения с БД"""
        if self.conn:
            self.conn.close()
            print("OK Соединение с БД закрыто")
    
    def get_or_create_subject(self, code: str, exam_type: str = 'oge') -> int:
        """Получить или создать предмет"""
        cursor = self.conn.cursor()
        
        # Проверяем, существует ли предмет
        cursor.execute(
            "SELECT id FROM subjects WHERE code = ? AND exam_type = ?",
            (code, exam_type)
        )
        row = cursor.fetchone()
        
        if row:
            return row[0]
        
        # Создаем новый предмет
        name = self.subject_names.get(code, code.upper())
        cursor.execute(
            "INSERT INTO subjects (code, name, exam_type) VALUES (?, ?, ?)",
            (code, name, exam_type)
        )
        self.conn.commit()
        return cursor.lastrowid
    
    def get_or_create_topic(self, subject_id: int, topic_number: str, topic_name: str, topic_line: str = None) -> int:
        """Получить или создать тему"""
        cursor = self.conn.cursor()
        
        # Проверяем, существует ли тема
        cursor.execute(
            "SELECT id FROM topics WHERE subject_id = ? AND topic_number = ?",
            (subject_id, topic_number)
        )
        row = cursor.fetchone()
        
        if row:
            return row[0]
        
        # Создаем новую тему
        cursor.execute(
            "INSERT INTO topics (subject_id, topic_number, topic_name, topic_line) VALUES (?, ?, ?, ?)",
            (subject_id, topic_number, topic_name, topic_line)
        )
        self.conn.commit()
        return cursor.lastrowid
    
    def get_or_create_category(self, topic_id: int, category_id: str, category_name: str) -> int:
        """Получить или создать категорию"""
        cursor = self.conn.cursor()
        
        # Проверяем, существует ли категория
        cursor.execute(
            "SELECT id FROM categories WHERE topic_id = ? AND category_id = ?",
            (topic_id, category_id)
        )
        row = cursor.fetchone()
        
        if row:
            return row[0]
        
        # Создаем новую категорию
        cursor.execute(
            "INSERT INTO categories (topic_id, category_id, category_name) VALUES (?, ?, ?)",
            (topic_id, category_id, category_name)
        )
        self.conn.commit()
        return cursor.lastrowid
    
    def problem_exists(self, subject_id: int, problem_id: str) -> bool:
        """Проверить, существует ли задача в БД"""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id FROM problems WHERE subject_id = ? AND problem_id = ?",
            (subject_id, problem_id)
        )
        return cursor.fetchone() is not None
    
    def extract_text_with_images(self, url: str, subject_code: str, problem_id: str, block_type: str) -> str:
        """
        Парсит HTML страницы и извлекает текст с изображениями в правильном порядке
        
        Args:
            url: URL задачи на СДАМ ГИА
            subject_code: Код предмета
            problem_id: ID задачи
            block_type: 'condition' или 'solution'
        
        Returns:
            Текст с markdown изображениями в правильных позициях
        """
        try:
            from bs4 import BeautifulSoup
            
            # Скачиваем страницу
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Находим блок с заданием
            prob_div = soup.find('div', {'class': 'prob_maindiv'})
            if not prob_div:
                return ''
            
            # Находим блоки с текстом (pbody)
            pbody_blocks = prob_div.find_all('div', {'class': 'pbody'})
            
            if block_type == 'condition' and len(pbody_blocks) > 0:
                target_block = pbody_blocks[0]
            elif block_type == 'solution' and len(pbody_blocks) > 1:
                target_block = pbody_blocks[1]
            else:
                return ''
            
            # Обрабатываем содержимое блока, сохраняя порядок элементов
            result = []
            img_counter = 0
            
            for element in target_block.descendants:
                # Текстовые узлы
                if element.name is None:
                    text = str(element).strip()
                    if text:
                        result.append(text)
                
                # Изображения
                elif element.name == 'img':
                    img_url = element.get('src', '')
                    if img_url:
                        # Формируем полный URL если нужно
                        if not img_url.startswith('http'):
                            base_url = '/'.join(url.split('/')[:3])
                            img_url = base_url + img_url
                        
                        # Скачиваем изображение
                        img_path = self.download_image(img_url, subject_code, problem_id, block_type, img_counter)
                        
                        if img_path:
                            # Формируем markdown для изображения
                            # Путь относительно server/
                            api_url = f'/tasks/images/{subject_code}/{problem_id}/{block_type}_{img_counter}'
                            
                            # Определяем расширение
                            ext = Path(img_path).suffix
                            result.append(f'![img](http://localhost:3001{api_url}{ext})')
                            img_counter += 1
                
                # Переносы строк
                elif element.name == 'br':
                    result.append('\n')
            
            # Объединяем результат с сохранением структуры
            text = ' '.join(result)
            
            # Убираем лишние пробелы но сохраняем переносы строк
            text = text.replace('  ', ' ').strip()
            
            return text
            
        except Exception as e:
            print(f"  WARNING Ошибка парсинга HTML для {block_type}: {e}")
            return ''
    
    def download_image(self, url: str, subject_code: str, problem_id: str, image_type: str, index: int) -> str:
        """
        Скачать изображение и сохранить в локальную папку
        
        Returns:
            Относительный путь к сохраненному изображению
        """
        try:
            # Скачиваем изображение сначала, чтобы определить реальный тип
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Определяем тип файла по содержимому
            content = response.content
            content_type = response.headers.get('content-type', '')
            
            # Определяем расширение по содержимому или заголовкам
            if content[:4] == b'<?xml' or content[:4] == b'<svg' or 'svg' in content_type:
                ext = '.svg'
            elif content[:4] == b'\x89PNG':
                ext = '.png'
            elif content[:3] == b'\xff\xd8\xff':
                ext = '.jpg'
            elif 'svg' in url:
                ext = '.svg'
            elif 'png' in url:
                ext = '.png'
            elif 'jpg' in url or 'jpeg' in url:
                ext = '.jpg'
            else:
                ext = '.svg'  # По умолчанию SVG для СДАМ ГИА
            
            # Создаем папку для задачи
            problem_dir = self.images_dir / subject_code / problem_id
            problem_dir.mkdir(parents=True, exist_ok=True)
            
            # Формируем имя файла
            filename = f"{image_type}_{index}{ext}"
            filepath = problem_dir / filename
            
            # Сохраняем файл
            with open(filepath, 'wb') as f:
                f.write(content)
            
            # Возвращаем относительный путь (от папки server)
            relative_path = f"image_tasksdb/{subject_code}/{problem_id}/{filename}"
            return relative_path
            
        except Exception as e:
            print(f"  WARNING Ошибка загрузки изображения {url}: {e}")
            return None
    
    def save_problem(self, subject_code: str, problem_data: dict, exam_type: str = 'oge', category_db_id: int = None):
        """Сохранить задачу в БД"""
        cursor = self.conn.cursor()
        
        try:
            # Получаем ID предмета
            subject_id = self.get_or_create_subject(subject_code, exam_type)
            
            # Проверяем, существует ли задача
            if self.problem_exists(subject_id, problem_data['id']):
                print(f"  SKIP Задача {problem_data['id']} уже существует, пропускаем")
                return False
            
            # Получаем или создаем тему
            topic_id = None
            if problem_data.get('topic'):
                topic_number = problem_data['topic']
                # Пытаемся извлечь название темы из каталога
                topic_name = f"Задание {topic_number}"
                topic_id = self.get_or_create_topic(
                    subject_id,
                    topic_number,
                    topic_name,
                    topic_line=topic_number  # Линия = номер задания
                )
            
            # Сохраняем задачу
            condition_text = problem_data['condition'].get('text', '')
            solution_text = problem_data['solution'].get('text', '')
            answer = problem_data.get('answer', '')
            url = problem_data.get('url', '')
            
            cursor.execute("""
                INSERT INTO problems 
                (subject_id, topic_id, problem_id, line, condition_text, solution_text, answer, url, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sdamgia')
            """, (subject_id, topic_id, problem_data['id'], problem_data.get('topic'), 
                  condition_text, solution_text, answer, url))
            
            problem_db_id = cursor.lastrowid
            
            # Связываем с категорией, если указана
            if category_db_id:
                cursor.execute("""
                    INSERT OR IGNORE INTO category_problems (category_id, problem_id)
                    VALUES (?, ?)
                """, (category_db_id, problem_db_id))
            
            # Сохраняем изображения условия
            condition_images = problem_data['condition'].get('images', [])
            for idx, img_url in enumerate(condition_images):
                img_path = self.download_image(img_url, subject_code, problem_data['id'], 'condition', idx)
                if img_path:
                    cursor.execute("""
                        INSERT INTO problem_condition_images 
                        (problem_id, image_url, image_path, image_order)
                        VALUES (?, ?, ?, ?)
                    """, (problem_db_id, img_url, img_path, idx))
            
            # Сохраняем изображения решения
            solution_images = problem_data['solution'].get('images', [])
            for idx, img_url in enumerate(solution_images):
                img_path = self.download_image(img_url, subject_code, problem_data['id'], 'solution', idx)
                if img_path:
                    cursor.execute("""
                        INSERT INTO problem_solution_images 
                        (problem_id, image_url, image_path, image_order)
                        VALUES (?, ?, ?, ?)
                    """, (problem_db_id, img_url, img_path, idx))
            
            self.conn.commit()
            print(f"  OK Задача {problem_data['id']} сохранена (изображений: условие={len(condition_images)}, решение={len(solution_images)})")
            return True
            
        except Exception as e:
            print(f"  ❌ Ошибка сохранения задачи {problem_data['id']}: {e}")
            self.conn.rollback()
            return False
    
    def load_problems_from_catalog(self, subject_code: str, exam_type: str = 'oge', count: int = 30, category_id: str = None):
        """
        Загрузить задачи из каталога СДАМ ГИА
        
        Args:
            subject_code: Код предмета (mathb, bio и т.д.)
            exam_type: Тип экзамена (oge, ege)
            count: Количество задач для загрузки
            category_id: ID категории (опционально, если нужно загрузить из конкретной категории)
        """
        print(f"\nЗагрузка заданий: {subject_code} ({exam_type.upper()})")
        print(f"   Целевое количество: {count} заданий")
        
        try:
            # Получаем каталог
            print("   Получение каталога...")
            catalog = self.sdamgia.get_catalog(subject_code)
            print(f"   Найдено тем в каталоге: {len(catalog)}")
            
            loaded_count = 0
            
            # Если указана категория, загружаем только из неё
            if category_id:
                print(f"   Загрузка из категории {category_id}...")
                problem_ids = self.sdamgia.get_category_by_id(subject_code, category_id)
                print(f"   Найдено задач в категории: {len(problem_ids)}")
                
                for problem_id in problem_ids[:count]:
                    try:
                        time.sleep(0.5)  # Задержка между запросами
                        print(f"   Загрузка задачи {problem_id}...")
                        problem_data = self.sdamgia.get_problem_by_id(subject_code, problem_id)
                        
                        if problem_data:
                            if self.save_problem(subject_code, problem_data, exam_type):
                                loaded_count += 1
                                
                            if loaded_count >= count:
                                break
                    except Exception as e:
                        print(f"   ⚠️  Ошибка загрузки задачи {problem_id}: {e}")
                        continue
            else:
                # Загружаем из всех категорий по порядку
                for topic in catalog:
                    if loaded_count >= count:
                        break
                    
                    topic_id = topic['topic_id']
                    topic_name = topic['topic_name']
                    print(f"\n   Тема {topic_id}: {topic_name}")
                    
                    # Получаем ID предмета и создаем тему в БД
                    subject_id = self.get_or_create_subject(subject_code, exam_type)
                    topic_db_id = self.get_or_create_topic(subject_id, topic_id, topic_name, topic_line=topic_id)
                    
                    # Обрабатываем категории
                    for category in topic['categories']:
                        if loaded_count >= count:
                            break
                        
                        cat_id = category['category_id']
                        cat_name = category['category_name']
                        print(f"      Категория: {cat_name}")
                        
                        # Создаем категорию в БД
                        category_db_id = self.get_or_create_category(topic_db_id, cat_id, cat_name)
                        
                        # Получаем задачи из категории
                        try:
                            problem_ids = self.sdamgia.get_category_by_id(subject_code, cat_id)
                            print(f"         Найдено задач: {len(problem_ids)}")
                            
                            # Загружаем первые несколько задач из категории
                            for problem_id in problem_ids[:3]:  # По 3 задачи из каждой категории
                                if loaded_count >= count:
                                    break
                                
                                try:
                                    time.sleep(0.5)  # Задержка между запросами
                                    print(f"         Загрузка задачи {problem_id}...")
                                    problem_data = self.sdamgia.get_problem_by_id(subject_code, problem_id)
                                    
                                    if problem_data:
                                        if self.save_problem(subject_code, problem_data, exam_type, category_db_id):
                                            loaded_count += 1
                                        
                                except Exception as e:
                                    print(f"         ⚠️  Ошибка загрузки задачи {problem_id}: {e}")
                                    continue
                                    
                        except Exception as e:
                            print(f"         ⚠️  Ошибка получения задач категории {cat_id}: {e}")
                            continue
            
            print(f"\nЗагрузка завершена! Загружено заданий: {loaded_count}/{count}")
            return loaded_count
            
        except Exception as e:
            print(f"❌ Ошибка загрузки каталога: {e}")
            return 0


def main():
    parser = argparse.ArgumentParser(description='Загрузка заданий из СДАМ ГИА')
    parser.add_argument('--subject', required=True, help='Код предмета (mathb, bio, rus и т.д.)')
    parser.add_argument('--exam-type', default='oge', choices=['oge', 'ege'], help='Тип экзамена')
    parser.add_argument('--count', type=int, default=30, help='Количество заданий для загрузки')
    parser.add_argument('--category', help='ID категории (опционально)')
    parser.add_argument('--db', default='../tasksbd.db', help='Путь к БД')
    parser.add_argument('--images-dir', default='../image_tasksdb', help='Папка для изображений')
    
    args = parser.parse_args()
    
    # Определяем пути относительно скрипта
    script_dir = Path(__file__).parent
    db_path = script_dir / args.db
    images_dir = script_dir / args.images_dir
    
    print("=" * 60)
    print("ЗАГРУЗКА ЗАДАНИЙ ИЗ СДАМ ГИА")
    print("=" * 60)
    print(f"Предмет: {args.subject}")
    print(f"Тип экзамена: {args.exam_type.upper()}")
    print(f"Количество: {args.count}")
    print(f"БД: {db_path}")
    print(f"Папка изображений: {images_dir}")
    print("=" * 60)
    
    # Создаем загрузчик
    loader = TasksLoader(str(db_path), str(images_dir))
    
    try:
        loader.connect()
        loader.load_problems_from_catalog(
            args.subject,
            args.exam_type,
            args.count,
            args.category
        )
    finally:
        loader.close()
    
    print("\nГотово!")


if __name__ == '__main__':
    main()

