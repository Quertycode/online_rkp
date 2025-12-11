#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для перезагрузки изображений для всех заданий в БД
Проверяет и скачивает изображения из СДАМ ГИА API
"""

import sys
import os
import json
import sqlite3
from pathlib import Path
import requests
from urllib.parse import urlparse

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

def get_oge_base_url(subject_code):
    """Получает базовый URL для ОГЭ по коду предмета"""
    # Для ОГЭ используются другие домены
    oge_domains = {
        'math': 'https://math-oge.sdamgia.ru',
        'mathb': 'https://math-oge.sdamgia.ru',  # Математика база использует тот же домен
        'bio': 'https://bio-oge.sdamgia.ru',
        'rus': 'https://rus-oge.sdamgia.ru',
        'russian': 'https://rus-oge.sdamgia.ru',
        'phys': 'https://phys-oge.sdamgia.ru',
        'inf': 'https://inf-oge.sdamgia.ru',
        'chem': 'https://chem-oge.sdamgia.ru',
        'geo': 'https://geo-oge.sdamgia.ru',
        'soc': 'https://soc-oge.sdamgia.ru',
        'hist': 'https://hist-oge.sdamgia.ru',
        'lit': 'https://lit-oge.sdamgia.ru',
        'en': 'https://en-oge.sdamgia.ru',
    }
    return oge_domains.get(subject_code, f'https://{subject_code}-oge.sdamgia.ru')

def get_problem_data_oge(subject_code, problem_id):
    """Получает данные задачи для ОГЭ напрямую с сайта"""
    import requests
    from bs4 import BeautifulSoup
    
    base_url = get_oge_base_url(subject_code)
    url = f'{base_url}/problem?id={problem_id}'
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        prob_block = soup.find('div', {'class': 'prob_maindiv'})
        
        if prob_block is None:
            return None
        
        # Парсим изображения из условия
        condition_images = []
        pbody_condition = prob_block.find_all('div', {'class': 'pbody'})
        if pbody_condition:
            for img in pbody_condition[0].find_all('img'):
                src = img.get('src', '')
                if src:
                    if not src.startswith('http'):
                        src = base_url + src
                    condition_images.append(src)
        
        # Парсим изображения из решения
        solution_images = []
        if len(pbody_condition) > 1:
            for img in pbody_condition[1].find_all('img'):
                src = img.get('src', '')
                if src:
                    if not src.startswith('http'):
                        src = base_url + src
                    solution_images.append(src)
        
        return {
            'condition': {'images': condition_images},
            'solution': {'images': solution_images}
        }
    except Exception as e:
        print(f'  ⚠️  Ошибка получения данных с сайта: {e}')
        return None

def download_image(image_url, save_path):
    """Скачивает изображение по URL"""
    try:
        # Создаем директорию, если её нет
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Скачиваем изображение
        response = requests.get(image_url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Сохраняем файл
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Проверяем, что файл не пустой и является изображением
        if save_path.stat().st_size == 0:
            print(f'  ⚠️  Файл пустой: {save_path}')
            return False
        
        # Проверяем первые байты файла (магические числа изображений)
        with open(save_path, 'rb') as f:
            header = f.read(8)
            # PNG: 89 50 4E 47
            # JPEG: FF D8 FF
            # GIF: 47 49 46 38
            # SVG: <svg или <?xml
            if header.startswith(b'\x89PNG') or \
               header.startswith(b'\xff\xd8\xff') or \
               header.startswith(b'GIF8') or \
               header.startswith(b'<svg') or \
               header.startswith(b'<?xml'):
                return True
            else:
                print(f'  ⚠️  Файл не является изображением: {save_path}')
                return False
                
    except Exception as e:
        print(f'  ❌ Ошибка скачивания {image_url}: {e}')
        if save_path.exists():
            save_path.unlink()
        return False

def get_image_path(subject_code, problem_id, image_type, index, image_url):
    """Определяет путь для сохранения изображения"""
    subject_dir = IMAGES_DIR / subject_code
    problem_dir = subject_dir / str(problem_id)
    problem_dir.mkdir(parents=True, exist_ok=True)
    
    # Определяем расширение из URL или по умолчанию
    parsed_url = urlparse(image_url)
    ext = Path(parsed_url.path).suffix
    if not ext:
        # Определяем по Content-Type или используем .png по умолчанию
        ext = '.png'
    
    filename = f'{image_type}_{index}{ext}'
    return problem_dir / filename

def reload_images_for_problem(db, problem_id, subject_code, problem_id_str):
    """Перезагружает изображения для одной задачи"""
    try:
        print(f'📥 Обрабатываем задачу {problem_id_str} ({subject_code})...')
        
        # Получаем данные задачи из СДАМ ГИА
        # API использует ЕГЭ домены, но у нас ОГЭ, поэтому используем прямой запрос
        problem_data = get_problem_data_oge(subject_code, problem_id_str)
        
        if not problem_data:
            # Пробуем через API (может быть ЕГЭ задача)
            try:
                problem_data = sdamgia.get_problem_by_id(subject_code, problem_id_str)
            except:
                pass
        
        if not problem_data:
            print(f'  ⚠️  Задача {problem_id_str} не найдена в СДАМ ГИА')
            return False
        
        # Получаем ID задачи в БД
        cursor = db.cursor()
        cursor.execute(
            'SELECT p.id FROM problems p JOIN subjects s ON p.subject_id = s.id WHERE p.problem_id = ? AND s.code = ?',
            (problem_id_str, subject_code)
        )
        db_problem_row = cursor.fetchone()
        
        if not db_problem_row:
            print(f'  ⚠️  Задача {problem_id_str} не найдена в БД')
            return False
        
        db_problem_id = db_problem_row[0]
        
        # Удаляем старые изображения из БД
        cursor.execute('DELETE FROM problem_condition_images WHERE problem_id = ?', (db_problem_id,))
        cursor.execute('DELETE FROM problem_solution_images WHERE problem_id = ?', (db_problem_id,))
        
        downloaded_count = 0
        
        # Скачиваем изображения условий
        if problem_data.get('condition', {}).get('images'):
            print(f'  📷 Найдено {len(problem_data["condition"]["images"])} изображений условий')
            for i, image_url in enumerate(problem_data['condition']['images']):
                img_path = get_image_path(subject_code, problem_id_str, 'condition', i, image_url)
                
                if download_image(image_url, img_path):
                    # Сохраняем относительный путь от папки server
                    relative_path = img_path.relative_to(Path(__file__).parent.parent)
                    relative_path_str = str(relative_path).replace('\\', '/')
                    
                    cursor.execute(
                        'INSERT INTO problem_condition_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)',
                        (db_problem_id, image_url, relative_path_str, i)
                    )
                    downloaded_count += 1
                    print(f'    ✅ Скачано: {relative_path_str}')
                else:
                    print(f'    ❌ Не удалось скачать: {image_url}')
        
        # Скачиваем изображения решений
        if problem_data.get('solution', {}).get('images'):
            print(f'  📷 Найдено {len(problem_data["solution"]["images"])} изображений решений')
            for i, image_url in enumerate(problem_data['solution']['images']):
                img_path = get_image_path(subject_code, problem_id_str, 'solution', i, image_url)
                
                if download_image(image_url, img_path):
                    # Сохраняем относительный путь от папки server
                    relative_path = img_path.relative_to(Path(__file__).parent.parent)
                    relative_path_str = str(relative_path).replace('\\', '/')
                    
                    cursor.execute(
                        'INSERT INTO problem_solution_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)',
                        (db_problem_id, image_url, relative_path_str, i)
                    )
                    downloaded_count += 1
                    print(f'    ✅ Скачано: {relative_path_str}')
                else:
                    print(f'    ❌ Не удалось скачать: {image_url}')
        
        db.commit()
        
        if downloaded_count > 0:
            print(f'  ✅ Загружено {downloaded_count} изображений для задачи {problem_id_str}')
            return True
        else:
            print(f'  ⚠️  Нет изображений для задачи {problem_id_str}')
            return False
            
    except Exception as e:
        print(f'  ❌ Ошибка при обработке задачи {problem_id_str}: {e}')
        import traceback
        traceback.print_exc()
        return False

def main():
    """Основная функция"""
    print('🚀 Начинаем перезагрузку изображений...\n')
    
    if not DB_PATH.exists():
        print(f'❌ База данных не найдена: {DB_PATH}')
        return
    
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    
    try:
        # Получаем все задачи из БД
        cursor = db.cursor()
        cursor.execute('''
            SELECT p.problem_id, s.code as subject_code
            FROM problems p
            JOIN subjects s ON p.subject_id = s.id
            ORDER BY s.code, p.problem_id
        ''')
        
        problems = cursor.fetchall()
        print(f'📚 Найдено {len(problems)} задач в БД\n')
        
        success_count = 0
        fail_count = 0
        
        for problem in problems:
            problem_id = problem['problem_id']
            subject_code = problem['subject_code']
            
            if reload_images_for_problem(db, problem_id, subject_code, str(problem_id)):
                success_count += 1
            else:
                fail_count += 1
            
            print()  # Пустая строка для читаемости
        
        print('\n📊 Статистика:')
        print(f'   ✅ Успешно обработано: {success_count}')
        print(f'   ❌ Ошибок: {fail_count}')
        print(f'   📷 Всего изображений загружено для {success_count} задач')
        
    finally:
        db.close()

if __name__ == '__main__':
    main()

