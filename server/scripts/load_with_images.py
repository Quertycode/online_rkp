# -*- coding: utf-8 -*-
"""
Простой скрипт загрузки с сохранением переносов строк и распределением изображений
"""

import sys
import os
import sqlite3
import requests
import argparse
from pathlib import Path
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../sdamgia-api'))
from sdamgia import SdamGIA


def save_image(url: str, subject_code: str, problem_id: str, image_type: str, index: int, images_dir: Path) -> str:
    """Скачивает и сохраняет изображение"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content = response.content
        
        # Определяем тип
        if content[:4] == b'<?xml' or content[:4] == b'<svg':
            ext = '.svg'
        elif content[:4] == b'\x89PNG':
            ext = '.png'
        else:
            ext = '.svg'
        
        # Сохраняем
        problem_dir = images_dir / subject_code / problem_id
        problem_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"{image_type}_{index}{ext}"
        filepath = problem_dir / filename
        
        with open(filepath, 'wb') as f:
            f.write(content)
        
        return f"{subject_code}/{problem_id}/{filename}"
    except:
        return None


def format_text_with_images(text: str, images: list, subject_code: str, problem_id: str, block_type: str, images_dir: Path) -> str:
    """
    Форматирует текст с изображениями
    Вставляет изображения в текст, сохраняя переносы строк
    """
    if not text:
        return ''
    
    # Сохраняем переносы строк
    lines = text.split('\n')
    
    result = []
    img_index = 0
    
    for i, line in enumerate(lines):
        result.append(line)
        
        # Распределяем изображения по тексту
        if images and img_index < len(images):
            # Вставляем изображение после каждого непустого блока текста
            if line.strip() and (i < len(lines) - 1 or img_index == 0):
                img_url = images[img_index]
                img_path = save_image(img_url, subject_code, problem_id, block_type, img_index, images_dir)
                
                if img_path:
                    result.append(f'\n![img](http://localhost:3001/tasks/images/{img_path})')
                    img_index += 1
    
    # Добавляем оставшиеся изображения в конец
    while img_index < len(images):
        img_url = images[img_index]
        img_path = save_image(img_url, subject_code, problem_id, block_type, img_index, images_dir)
        if img_path:
            result.append(f'\n![img](http://localhost:3001/tasks/images/{img_path})')
        img_index += 1
    
    return '\n'.join(result)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--subject', required=True)
    parser.add_argument('--exam-type', default='oge')
    parser.add_argument('--ids', required=True)
    parser.add_argument('--db', default='../tasksbd.db')
    parser.add_argument('--images-dir', default='../image_tasksdb')
    
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    db_path = script_dir / args.db
    images_dir = script_dir / args.images_dir
    
    print(f"Загрузка {args.subject} ({args.exam_type.upper()})")
    
    sdamgia = SdamGIA()
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Создаем предмет
    names = {'mathb': 'Математика (База)', 'bio': 'Биология'}
    cursor.execute("INSERT OR IGNORE INTO subjects (code, name, exam_type) VALUES (?, ?, ?)",
                   (args.subject, names.get(args.subject, args.subject), args.exam_type))
    conn.commit()
    
    cursor.execute("SELECT id FROM subjects WHERE code = ?", (args.subject,))
    subject_id = cursor.fetchone()[0]
    
    problem_ids = [pid.strip() for pid in args.ids.split(',')]
    
    for problem_id in problem_ids:
        print(f"\nЗагрузка {problem_id}...")
        
        try:
            # Получаем данные
            data = sdamgia.get_problem_by_id(args.subject, problem_id)
            
            if not data:
                print(f"  ERROR: Не найдена")
                continue
            
            # Форматируем текст с изображениями
            condition = format_text_with_images(
                data['condition'].get('text', ''),
                data['condition'].get('images', []),
                args.subject, problem_id, 'condition', images_dir
            )
            
            solution = format_text_with_images(
                data['solution'].get('text', ''),
                data['solution'].get('images', []),
                args.subject, problem_id, 'solution', images_dir
            )
            
            # Сохраняем
            cursor.execute("""
                INSERT INTO problems 
                (subject_id, problem_id, line, condition_text, solution_text, answer, url, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'sdamgia')
            """, (subject_id, problem_id, data.get('topic'), condition, solution, data.get('answer'), data.get('url')))
            
            conn.commit()
            
            img_count = condition.count('![img](') + solution.count('![img](')
            print(f"  OK: Сохранена (изображений: {img_count})")
            
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  ERROR: {e}")
    
    conn.close()
    print("\nГотово!")


if __name__ == '__main__':
    main()


