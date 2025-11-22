# -*- coding: utf-8 -*-
"""
ПОЛНЫЙ парсер HTML страниц СДАМ ГИА с сохранением ВСЕХ доступных данных:
- Условие и решение с inline изображениями
- Ответ
- Тема (с названием из каталога)
- Аналогичные задачи
- Категории (из каталога)
"""

import sys
import os
import sqlite3
import requests
import argparse
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import time

# Добавляем путь к sdamgia-api
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'sdamgia-api'))
try:
    from sdamgia import SdamGIA
    SDAMGIA_AVAILABLE = True
except ImportError:
    SDAMGIA_AVAILABLE = False
    print("WARNING: sdamgia-api не установлен. Каталог и аналоги будут загружаться из HTML.")


def save_image(url: str, subject_code: str, problem_id: str, img_type: str, index: int, images_dir: Path) -> str:
    """Скачивает изображение"""
    try:
        if not url.startswith('http'):
            url = f"https://{subject_code}-ege.sdamgia.ru{url}"
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content = response.content
        
        # Определяем тип
        if content[:4] in (b'<?xml', b'<svg') or b'<svg' in content[:100]:
            ext = '.svg'
        elif content[:4] == b'\x89PNG':
            ext = '.png'
        elif content[:3] == b'\xff\xd8\xff':
            ext = '.jpg'
        else:
            ext = '.svg'
        
        # Сохраняем
        problem_dir = images_dir / subject_code / problem_id
        problem_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"{img_type}_{index}{ext}"
        with open(problem_dir / filename, 'wb') as f:
            f.write(content)
        
        return f"{subject_code}/{problem_id}/{filename}"
    except Exception as e:
        print(f"    WARNING: Ошибка скачивания изображения: {e}")
        return None


def parse_html_block(block, subject_code: str, problem_id: str, block_type: str, images_dir: Path) -> str:
    """
    Рекурсивно парсит HTML блок, сохраняя точный порядок текста и изображений
    ВАЖНО: Inline изображения (формулы) вставляются БЕЗ переносов строк
    Исключает служебные элементы: rule_info, rule_body
    """
    if not block:
        return ''
    
    # Удаляем служебные элементы перед парсингом
    for element in block.find_all(['div', 'span'], class_=['rule_info', 'rule_body']):
        element.decompose()
    
    result = []
    img_counter = [0]
    
    def process_node(node, is_inline=True):
        """
        Рекурсивно обрабатывает узел DOM
        is_inline - находится ли узел внутри строки текста (для inline формул)
        """
        
        # Пропускаем служебные элементы
        if hasattr(node, 'get') and node.get('class'):
            classes = node.get('class', [])
            if 'rule_info' in classes or 'rule_body' in classes:
                return
        
        if isinstance(node, NavigableString):
            # Текстовый узел
            text = str(node)
            # Сохраняем пробелы, но не добавляем лишние переносы
            if text:
                result.append(text)
        
        elif node.name == 'img':
            # Изображение (формула) - вставляем inline БЕЗ переносов
            img_url = node.get('src', '')
            if img_url:
                img_path = save_image(img_url, subject_code, problem_id, block_type, img_counter[0], images_dir)
                if img_path:
                    # Inline изображение - вставляем прямо в текст
                    result.append(f'![img](http://localhost:3001/tasks/images/{img_path})')
                    img_counter[0] += 1
        
        elif node.name == 'br':
            # Явный перенос строки
            result.append('\n')
        
        elif node.name in ('p', 'div'):
            # Блочные элементы - добавляем перенос ДО (если нужно)
            if result and not result[-1].endswith('\n'):
                result.append('\n')
            
            # Обрабатываем содержимое как блочное
            for child in node.children:
                process_node(child, is_inline=False)
            
            # Добавляем перенос ПОСЛЕ
            if result and not result[-1].endswith('\n'):
                result.append('\n')
        
        elif node.name in ('span', 'b', 'i', 'strong', 'em'):
            # Inline элементы - обрабатываем содержимое как inline
            for child in node.children:
                process_node(child, is_inline=True)
        
        elif node.name:
            # Другие элементы - обрабатываем как inline по умолчанию
            for child in node.children:
                process_node(child, is_inline=True)
    
    # Обрабатываем все дочерние узлы как inline (формулы в тексте)
    for child in block.children:
        process_node(child, is_inline=True)
    
    # Объединяем результат
    text = ''.join(result)
    
    # Убираем лишние пустые строки в начале и конце
    text = text.strip()
    
    # Убираем множественные пустые строки (оставляем максимум одну)
    while '\n\n\n' in text:
        text = text.replace('\n\n\n', '\n\n')
    
    # Для решения: очищаем от служебных элементов и текста
    if block_type == 'solution':
        # Убираем текст "rule_info." и "rule_body" из текста
        text = text.replace('rule_info.', '').replace('rule_body', '').strip()
        
        # Убираем "Решение" или "Пояснение" в начале (может быть с разными пробелами/переносами)
        text = text.lstrip()
        # Используем регулярное выражение для более точного поиска
        import re
        # Убираем "Решение" или "Пояснение" в начале (с учетом мягких переносов)
        text = re.sub(r'^[Рр]е[­\s]*[шщ]е[­\s]*ни[­\s]*е[\.\:\s]*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^[Пп]о[­\s]*я[­\s]*с[­\s]*не[­\s]*ни[­\s]*е[\.\:\s]*', '', text, flags=re.IGNORECASE)
        text = text.lstrip()
        
        # Убираем точки и двоеточия в начале
        while text.startswith('.') or text.startswith(':') or text.startswith(' '):
            text = text[1:].lstrip()
        
        # Убираем "Ответ:" из конца решения (если есть) - ответ сохраняется отдельно
        # Но оставляем текст до "Ответ:"
        if 'Ответ:' in text or 'Ответ ' in text:
            answer_pos = max(text.find('Ответ:'), text.find('Ответ '))
            if answer_pos > 0:
                text = text[:answer_pos].rstrip()
    
    return text


def load_problem(problem_id: str, subject_code: str, exam_type: str, db_path: Path, images_dir: Path):
    """Загружает одну задачу"""
    
    try:
        # Формируем URL
        if subject_code == 'mathb':
            url = f"https://mathb-ege.sdamgia.ru/problem?id={problem_id}"
        else:
            url = f"https://{subject_code}-ege.sdamgia.ru/problem?id={problem_id}"
        
        print(f"  Загрузка с {url}")
        
        # Скачиваем страницу
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Находим блок задачи
        prob_div = soup.find('div', {'class': 'prob_maindiv'})
        if not prob_div:
            print(f"  ERROR: Не найден блок задачи")
            return False
        
        # Находим блоки с текстом
        pbody_blocks = prob_div.find_all('div', {'class': 'pbody'})
        
        if len(pbody_blocks) == 0:
            print(f"  ERROR: Нет блоков pbody")
            return False
        
        # Парсим условие
        condition = parse_html_block(pbody_blocks[0], subject_code, problem_id, 'condition', images_dir)
        
        # Парсим решение (если есть)
        solution = ''
        if len(pbody_blocks) > 1:
            solution = parse_html_block(pbody_blocks[1], subject_code, problem_id, 'solution', images_dir)
        
        # Получаем ответ
        answer = ''
        answer_div = prob_div.find('div', {'class': 'answer'})
        if answer_div:
            answer_text = answer_div.get_text().strip()
            # Убираем "Ответ:" или "Ответ" в начале
            if answer_text.lower().startswith('ответ'):
                answer_text = answer_text[5:].lstrip()  # "Ответ" = 5 символов
                # Убираем двоеточие если есть
                if answer_text.startswith(':'):
                    answer_text = answer_text[1:].lstrip()
            answer = answer_text.strip()
        
        # Если ответ не найден в отдельном блоке, пытаемся извлечь из решения
        if not answer and len(pbody_blocks) > 1:
            solution_text_raw = pbody_blocks[1].get_text()
            if 'Ответ:' in solution_text_raw or 'Ответ ' in solution_text_raw:
                # Ищем "Ответ:" или "Ответ " в тексте
                import re
                answer_match = re.search(r'Ответ[:\s]+([^\n\.]+)', solution_text_raw, re.IGNORECASE)
                if answer_match:
                    answer = answer_match.group(1).strip().rstrip('.')
        
        # Получаем номер темы (задания)
        topic_number = None
        topic_name = None
        nums_span = prob_div.find('span', {'class': 'prob_nums'})
        if nums_span:
            nums_text = nums_span.get_text().strip()
            # Извлекаем номер темы (например "Тип 4 № 506304" -> "4")
            parts = nums_text.split()
            # Ищем "Тип" и берем следующее число
            for i, part in enumerate(parts):
                if part == 'Тип' and i + 1 < len(parts):
                    # Берем следующее слово (номер темы)
                    next_part = parts[i + 1]
                    # Убираем символы, оставляем только цифры
                    topic_number = ''.join(c for c in next_part if c.isdigit())
                    if topic_number:
                        break
        
        # Получаем аналогичные задачи
        analogs = []
        minor_div = prob_div.find('div', {'class': 'minor'})
        if minor_div:
            analog_links = minor_div.find_all('a')
            for link in analog_links:
                link_text = link.get_text().strip()
                if link_text and link_text != 'Все' and link_text.isdigit():
                    analogs.append(link_text)
        
        # Сохраняем в БД
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Создаем предмет если нужно
        names = {'mathb': 'Математика (База)', 'bio': 'Биология', 'math': 'Математика (Профиль)',
                 'rus': 'Русский язык', 'phys': 'Физика', 'inf': 'Информатика', 'chem': 'Химия',
                 'geo': 'География', 'soc': 'Обществознание', 'hist': 'История', 'lit': 'Литература',
                 'en': 'Английский', 'de': 'Немецкий', 'fr': 'Французский', 'sp': 'Испанский'}
        cursor.execute("INSERT OR IGNORE INTO subjects (code, name, exam_type) VALUES (?, ?, ?)",
                       (subject_code, names.get(subject_code, subject_code), exam_type))
        conn.commit()
        
        cursor.execute("SELECT id FROM subjects WHERE code = ? AND exam_type = ?", (subject_code, exam_type))
        subject_id = cursor.fetchone()[0]
        
        # Создаем или находим тему
        topic_id = None
        if topic_number:
            # Проверяем, существует ли тема
            cursor.execute("SELECT id, topic_name FROM topics WHERE subject_id = ? AND topic_number = ?",
                          (subject_id, topic_number))
            topic_row = cursor.fetchone()
            
            if topic_row:
                topic_id = topic_row[0]
                if not topic_name:
                    topic_name = topic_row[1]
            else:
                # Создаем новую тему
                if not topic_name:
                    topic_name = f'Задание {topic_number}'
                cursor.execute("""
                    INSERT INTO topics (subject_id, topic_number, topic_name, topic_line)
                    VALUES (?, ?, ?, ?)
                """, (subject_id, topic_number, topic_name, topic_number))
                topic_id = cursor.lastrowid
                conn.commit()
        
        # Сохраняем задачу
        cursor.execute("""
            INSERT OR REPLACE INTO problems 
            (subject_id, topic_id, problem_id, line, condition_text, solution_text, answer, url, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sdamgia')
        """, (subject_id, topic_id, problem_id, topic_number, condition, solution, answer, url))
        
        problem_db_id = cursor.lastrowid
        
        # Сохраняем аналогичные задачи
        if analogs:
            for analog_id in analogs:
                # Находим ID аналогичной задачи в БД (если она уже загружена)
                cursor.execute("SELECT id FROM problems WHERE subject_id = ? AND problem_id = ?",
                              (subject_id, analog_id))
                analog_row = cursor.fetchone()
                
                if analog_row:
                    analog_db_id = analog_row[0]
                    # Сохраняем связь (в обе стороны)
                    cursor.execute("""
                        INSERT OR IGNORE INTO problem_analogs (problem_id, analog_problem_id)
                        VALUES (?, ?)
                    """, (problem_db_id, analog_db_id))
                    cursor.execute("""
                        INSERT OR IGNORE INTO problem_analogs (problem_id, analog_problem_id)
                        VALUES (?, ?)
                    """, (analog_db_id, problem_db_id))
        
        # Связываем задачу с категориями темы (если категории уже загружены)
        if topic_id:
            cursor.execute("""
                SELECT id FROM categories WHERE topic_id = ?
            """, (topic_id,))
            category_rows = cursor.fetchall()
            
            for cat_row in category_rows:
                cat_db_id = cat_row[0]
                cursor.execute("""
                    INSERT OR IGNORE INTO category_problems (category_id, problem_id)
                    VALUES (?, ?)
                """, (cat_db_id, problem_db_id))
        
        conn.commit()
        conn.close()
        
        img_count = condition.count('![img](') + solution.count('![img](')
        analogs_count = len(analogs)
        print(f"  OK: Сохранена (изображений: {img_count}, аналогичных: {analogs_count})")
        return True
        
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(description='Полная загрузка задач из СДАМ ГИА со всеми данными')
    parser.add_argument('--subject', required=True, help='Код предмета (mathb, bio, math и т.д.)')
    parser.add_argument('--exam-type', default='oge', choices=['oge', 'ege'], help='Тип экзамена')
    parser.add_argument('--ids', required=True, help='ID задач через запятую (например: "506304,4612")')
    parser.add_argument('--db', default='../tasksbd.db', help='Путь к БД')
    parser.add_argument('--images-dir', default='../image_tasksdb', help='Папка для изображений')
    
    args = parser.parse_args()
    
    script_dir = Path(__file__).parent
    db_path = script_dir / args.db
    images_dir = script_dir / args.images_dir
    
    print(f"\nЗагрузка {args.subject} ({args.exam_type.upper()})")
    print("=" * 60)
    
    problem_ids = [pid.strip() for pid in args.ids.split(',')]
    
    for problem_id in problem_ids:
        print(f"\n[{problem_id}]")
        load_problem(problem_id, args.subject, args.exam_type, db_path, images_dir)
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("Готово!\n")


if __name__ == '__main__':
    main()

