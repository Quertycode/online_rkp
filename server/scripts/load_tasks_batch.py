# -*- coding: utf-8 -*-
"""
Скрипт для массовой загрузки заданий из разных линий
Загружает задания из разных тем (topics) для обеспечения разнообразия линий
Использует HTML парсинг для сохранения структуры и переносов строк
"""

import sys
import os
import time
from pathlib import Path

# Добавляем путь к sdamgia-api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../sdamgia-api'))

# Используем HTML парсер для сохранения структуры
sys.path.insert(0, os.path.dirname(__file__))
from load_html_parser import load_problem, load_catalog

def load_tasks_from_different_lines(subject_code: str, exam_type: str, count: int, db_path: str, images_dir: str):
    """
    Загружает задания из разных линий (тем) используя HTML парсинг
    Сохраняет HTML структуру с переносами строк и правильными размерами изображений
    
    Args:
        subject_code: Код предмета (bio, mathb и т.д.)
        exam_type: Тип экзамена (oge, ege)
        count: Количество заданий для загрузки
        db_path: Путь к БД
        images_dir: Папка для изображений
    """
    print(f"\n{'='*60}")
    print(f"ЗАГРУЗКА ЗАДАНИЙ: {subject_code.upper()} ({exam_type.upper()})")
    print(f"Целевое количество: {count} заданий из разных линий")
    print(f"Используется HTML парсинг для сохранения структуры")
    print(f"{'='*60}\n")
    
    db_path_obj = Path(db_path)
    images_dir_obj = Path(images_dir)
    
    try:
        # Загружаем каталог
        print("Загрузка каталога...")
        catalog = load_catalog(subject_code, exam_type, db_path_obj)
        print(f"Каталог загружен: {len(catalog)} тем\n")
        
        # Получаем список всех категорий из каталога
        from sdamgia import SdamGIA
        sdamgia = SdamGIA()
        catalog_data = sdamgia.get_catalog(subject_code)
        
        loaded_count = 0
        tasks_per_topic = max(1, count // len(catalog_data)) if catalog_data else 5
        
        # Проходим по всем темам для разнообразия линий
        for topic_idx, topic in enumerate(catalog_data):
            if loaded_count >= count:
                break
            
            topic_id = topic['topic_id']
            topic_name = topic['topic_name']
            print(f"\nТема {topic_idx + 1}/{len(catalog_data)}: {topic_id} - {topic_name}")
            
            # Определяем, сколько задач нужно загрузить из этой темы
            remaining = count - loaded_count
            tasks_from_this_topic = min(tasks_per_topic, remaining)
            
            # Проходим по категориям темы
            for category in topic.get('categories', []):
                if loaded_count >= count:
                    break
                
                cat_id = category['category_id']
                cat_name = category['category_name']
                
                # Получаем задачи из категории
                try:
                    problem_ids = sdamgia.get_category_by_id(subject_code, cat_id)
                    
                    if not problem_ids:
                        continue
                    
                    # Загружаем задачи из категории
                    problems_to_load = min(10, len(problem_ids), count - loaded_count)
                    
                    print(f"  Категория: {cat_name} (найдено задач: {len(problem_ids)}, загружаем: {problems_to_load})")
                    
                    for problem_id in problem_ids[:problems_to_load]:
                        if loaded_count >= count:
                            break
                        
                        try:
                            time.sleep(0.5)  # Задержка между запросами
                            
                            # Используем HTML парсер для сохранения структуры
                            if load_problem(problem_id, subject_code, exam_type, db_path_obj, images_dir_obj, catalog):
                                loaded_count += 1
                                if loaded_count % 10 == 0:
                                    print(f"    Загружено: {loaded_count}/{count}")
                                    
                        except Exception as e:
                            print(f"    ⚠️  Ошибка загрузки задачи {problem_id}: {e}")
                            continue
                            
                except Exception as e:
                    print(f"  ⚠️  Ошибка получения задач категории {cat_id}: {e}")
                    continue
        
        print(f"\n{'='*60}")
        print(f"Загрузка завершена!")
        print(f"Загружено заданий: {loaded_count}/{count}")
        print(f"{'='*60}\n")
        
        return loaded_count
        
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
        return 0


def main():
    """Основная функция"""
    script_dir = Path(__file__).parent
    db_path = str(script_dir / '../tasksbd.db')
    images_dir = str(script_dir / '../image_tasksdb')
    
    print("=" * 60)
    print("МАССОВАЯ ЗАГРУЗКА ЗАДАНИЙ ИЗ РАЗНЫХ ЛИНИЙ")
    print("=" * 60)
    print(f"БД: {db_path}")
    print(f"Папка изображений: {images_dir}")
    print("=" * 60)
    
    # Загружаем биологию ОГЭ - 300 заданий
    print("\n" + "="*60)
    print("ШАГ 1: Загрузка биологии ОГЭ (300 заданий)")
    print("="*60)
    load_tasks_from_different_lines('bio', 'oge', 300, db_path, images_dir)
    
    # Загружаем математику базу ОГЭ - 200 заданий
    print("\n" + "="*60)
    print("ШАГ 2: Загрузка математики базы ОГЭ (200 заданий)")
    print("="*60)
    load_tasks_from_different_lines('mathb', 'oge', 200, db_path, images_dir)
    
    print("\n" + "="*60)
    print("ВСЕ ЗАДАНИЯ ЗАГРУЖЕНЫ!")
    print("="*60)


if __name__ == '__main__':
    main()

