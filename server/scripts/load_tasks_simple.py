# -*- coding: utf-8 -*-
"""
Упрощенный скрипт для загрузки заданий с изображениями в правильном порядке
"""

import sys
import os
import sqlite3
import requests
import argparse
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import time

# Добавляем путь к sdamgia-api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../sdamgia-api'))

from sdamgia import SdamGIA


class SimpleTasksLoader:
    def __init__(self, db_path: str, images_dir: str):
        self.db_path = db_path
        self.images_dir = Path(images_dir)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.sdamgia = SdamGIA()
        self.conn = None
        
        self.subject_names = {
            'mathb': 'Математика (База)',
            'bio': 'Биология',
        }
    
    def connect(self):
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        print(f"OK Подключено к БД: {self.db_path}")
    
    def close(self):
        if self.conn:
            self.conn.close()
    
    def get_or_create_subject(self, code: str, exam_type: str = 'oge') -> int:
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM subjects WHERE code = ? AND exam_type = ?", (code, exam_type))
        row = cursor.fetchone()
        
        if row:
            return row[0]
        
        name = self.subject_names.get(code, code.upper())
        cursor.execute("INSERT INTO subjects (code, name, exam_type) VALUES (?, ?, ?)", (code, name, exam_type))
        self.conn.commit()
        return cursor.lastrowid
    
    def problem_exists(self, subject_id: int, problem_id: str) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM problems WHERE subject_id = ? AND problem_id = ?", (subject_id, problem_id))
        return cursor.fetchone() is not None
    
    def download_and_parse_problem(self, url: str, subject_code: str, problem_id: str):
        """
        Скачивает HTML страницы и парсит текст с изображениями в правильном порядке
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            prob_div = soup.find('div', {'class': 'prob_maindiv'})
            
            if not prob_div:
                return None, None
            
            # Получаем блоки текста
            pbody_blocks = prob_div.find_all('div', {'class': 'pbody'})
            
            condition_text = self.parse_block_with_images(
                pbody_blocks[0] if len(pbody_blocks) > 0 else None,
                subject_code, problem_id, 'condition'
            )
            
            solution_text = self.parse_block_with_images(
                pbody_blocks[1] if len(pbody_blocks) > 1 else None,
                subject_code, problem_id, 'solution'
            )
            
            return condition_text, solution_text
            
        except Exception as e:
            print(f"  ERROR Ошибка парсинга: {e}")
            return None, None
    
    def parse_block_with_images(self, block, subject_code: str, problem_id: str, block_type: str) -> str:
        """
        Парсит блок текста, сохраняя порядок текста и изображений
        """
        if not block:
            return ''
        
        result = []
        img_counter = 0
        
        # Обходим все элементы блока
        for element in block.children:
            if element.name == 'img':
                # Это изображение
                img_url = element.get('src', '')
                if img_url and 'sdamgia.ru' in img_url:
                    # Скачиваем и сохраняем
                    img_path = self.save_image(img_url, subject_code, problem_id, block_type, img_counter)
                    if img_path:
                        # Добавляем markdown
                        result.append(f'\n![img](http://localhost:3001/tasks/images/{img_path})\n')
                        img_counter += 1
            
            elif hasattr(element, 'get_text'):
                # Это элемент с текстом
                # Рекурсивно обрабатываем вложенные элементы
                text = self.extract_text_with_inline_images(element, subject_code, problem_id, block_type, img_counter)
                if text.strip():
                    result.append(text)
            
            elif isinstance(element, str):
                # Это текстовая нода
                text = element.strip()
                if text:
                    result.append(text)
        
        return ''.join(result)
    
    def extract_text_with_inline_images(self, element, subject_code: str, problem_id: str, block_type: str, img_counter: int) -> str:
        """
        Рекурсивно извлекает текст с инлайн-изображениями
        """
        result = []
        
        for child in element.children:
            if child.name == 'img':
                img_url = child.get('src', '')
                if img_url and 'sdamgia.ru' in img_url:
                    img_path = self.save_image(img_url, subject_code, problem_id, block_type, img_counter)
                    if img_path:
                        result.append(f'![img](http://localhost:3001/tasks/images/{img_path})')
                        img_counter += 1
            
            elif child.name == 'br':
                result.append('\n')
            
            elif hasattr(child, 'get_text'):
                result.append(self.extract_text_with_inline_images(child, subject_code, problem_id, block_type, img_counter))
            
            elif isinstance(child, str):
                result.append(child)
        
        return ''.join(result)
    
    def save_image(self, url: str, subject_code: str, problem_id: str, image_type: str, index: int) -> str:
        """
        Скачивает и сохраняет изображение
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            content = response.content
            
            # Определяем тип файла
            if content[:4] == b'<?xml' or content[:4] == b'<svg':
                ext = '.svg'
            elif content[:4] == b'\x89PNG':
                ext = '.png'
            elif content[:3] == b'\xff\xd8\xff':
                ext = '.jpg'
            else:
                ext = '.svg'
            
            # Создаем папку
            problem_dir = self.images_dir / subject_code / problem_id
            problem_dir.mkdir(parents=True, exist_ok=True)
            
            # Сохраняем файл
            filename = f"{image_type}_{index}{ext}"
            filepath = problem_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(content)
            
            # Возвращаем относительный путь
            return f"{subject_code}/{problem_id}/{filename}"
            
        except Exception as e:
            print(f"  WARNING Ошибка скачивания изображения: {e}")
            return None
    
    def save_problem(self, problem_id: str, subject_code: str, exam_type: str = 'oge'):
        """
        Сохраняет одну задачу в БД
        """
        try:
            # Получаем данные задачи
            problem_data = self.sdamgia.get_problem_by_id(subject_code, problem_id)
            if not problem_data:
                print(f"  ERROR Задача {problem_id} не найдена")
                return False
            
            # Проверяем наличие
            subject_id = self.get_or_create_subject(subject_code, exam_type)
            if self.problem_exists(subject_id, problem_id):
                print(f"  SKIP Задача {problem_id} уже существует")
                return False
            
            # Парсим HTML для получения текста с изображениями в правильном порядке
            url = problem_data.get('url', '')
            condition_text, solution_text = self.download_and_parse_problem(url, subject_code, problem_id)
            
            if not condition_text:
                condition_text = problem_data['condition'].get('text', '')
            if not solution_text:
                solution_text = problem_data['solution'].get('text', '')
            
            answer = problem_data.get('answer', '')
            topic = problem_data.get('topic', '')
            
            # Сохраняем в БД
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO problems 
                (subject_id, problem_id, line, condition_text, solution_text, answer, url, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'sdamgia')
            """, (subject_id, problem_id, topic, condition_text, solution_text, answer, url))
            
            self.conn.commit()
            
            img_count = condition_text.count('![img](') + solution_text.count('![img](')
            print(f"  OK Задача {problem_id} сохранена (изображений: {img_count})")
            return True
            
        except Exception as e:
            print(f"  ERROR Ошибка: {e}")
            return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--subject', required=True)
    parser.add_argument('--exam-type', default='oge')
    parser.add_argument('--ids', required=True, help='ID заданий через запятую')
    parser.add_argument('--db', default='../tasksbd.db')
    parser.add_argument('--images-dir', default='../image_tasksdb')
    
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    db_path = script_dir / args.db
    images_dir = script_dir / args.images_dir
    
    print("=" * 60)
    print(f"Загрузка заданий: {args.subject} ({args.exam_type.upper()})")
    print("=" * 60)
    
    loader = SimpleTasksLoader(str(db_path), str(images_dir))
    
    try:
        loader.connect()
        
        problem_ids = [pid.strip() for pid in args.ids.split(',')]
        
        for problem_id in problem_ids:
            print(f"\nЗагрузка задачи {problem_id}...")
            loader.save_problem(problem_id, args.subject, args.exam_type)
            time.sleep(0.5)
        
        print("\nГотово!")
        
    finally:
        loader.close()


if __name__ == '__main__':
    main()


