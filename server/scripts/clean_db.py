# -*- coding: utf-8 -*-
"""
Скрипт для очистки базы данных и изображений

Использование:
    python clean_db.py --confirm  # Удалить все данные
    python clean_db.py --subject mathb  # Удалить только данные по предмету
"""

import sys
import os
import sqlite3
import argparse
import shutil
from pathlib import Path


def clean_database(db_path: str, subject_code: str = None):
    """Очистить базу данных"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        if subject_code:
            print(f"🗑️  Удаление данных по предмету: {subject_code}")
            
            # Получаем ID предмета
            cursor.execute("SELECT id FROM subjects WHERE code = ?", (subject_code,))
            subject_row = cursor.fetchone()
            
            if not subject_row:
                print(f"⚠️  Предмет {subject_code} не найден в БД")
                return
            
            subject_id = subject_row[0]
            
            # Удаляем все связанные данные (каскадное удаление через внешние ключи)
            cursor.execute("DELETE FROM problems WHERE subject_id = ?", (subject_id,))
            cursor.execute("DELETE FROM topics WHERE subject_id = ?", (subject_id,))
            cursor.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
            
            conn.commit()
            print(f"✅ Данные по предмету {subject_code} удалены")
        else:
            print("🗑️  Удаление ВСЕХ данных из БД")
            
            # Удаляем все данные
            tables = [
                'test_problems',
                'tests',
                'problem_analogs',
                'category_problems',
                'problem_solution_images',
                'problem_condition_images',
                'problems',
                'categories',
                'topics',
                'subjects',
            ]
            
            for table in tables:
                cursor.execute(f"DELETE FROM {table}")
                print(f"   ✅ Таблица {table} очищена")
            
            conn.commit()
            print("✅ Все данные удалены")
            
    except Exception as e:
        print(f"❌ Ошибка очистки БД: {e}")
        conn.rollback()
    finally:
        conn.close()


def clean_images(images_dir: str, subject_code: str = None):
    """Очистить папку с изображениями"""
    images_path = Path(images_dir)
    
    if not images_path.exists():
        print(f"⚠️  Папка {images_dir} не существует")
        return
    
    try:
        if subject_code:
            subject_dir = images_path / subject_code
            if subject_dir.exists():
                print(f"🗑️  Удаление изображений предмета: {subject_code}")
                shutil.rmtree(subject_dir)
                print(f"✅ Папка {subject_code} удалена")
            else:
                print(f"⚠️  Папка {subject_code} не найдена")
        else:
            print(f"🗑️  Удаление ВСЕХ изображений из {images_dir}")
            
            # Удаляем все подпапки
            for item in images_path.iterdir():
                if item.is_dir():
                    print(f"   Удаление {item.name}...")
                    shutil.rmtree(item)
            
            print("✅ Все изображения удалены")
            
    except Exception as e:
        print(f"❌ Ошибка удаления изображений: {e}")


def main():
    parser = argparse.ArgumentParser(description='Очистка базы данных и изображений')
    parser.add_argument('--confirm', action='store_true', help='Подтвердить удаление')
    parser.add_argument('--subject', help='Код предмета для удаления (опционально)')
    parser.add_argument('--db', default='../tasksbd.db', help='Путь к БД')
    parser.add_argument('--images-dir', default='../image_tasksdb', help='Папка для изображений')
    
    args = parser.parse_args()
    
    if not args.confirm:
        print("⚠️  Для подтверждения удаления используйте флаг --confirm")
        print("   Пример: python clean_db.py --confirm")
        return
    
    # Определяем пути относительно скрипта
    script_dir = Path(__file__).parent
    db_path = script_dir / args.db
    images_dir = script_dir / args.images_dir
    
    print("=" * 60)
    print("🗑️  ОЧИСТКА БАЗЫ ДАННЫХ")
    print("=" * 60)
    
    if args.subject:
        print(f"Предмет: {args.subject}")
    else:
        print("⚠️  ВНИМАНИЕ: Будут удалены ВСЕ данные!")
    
    print(f"БД: {db_path}")
    print(f"Папка изображений: {images_dir}")
    print("=" * 60)
    
    # Запрос подтверждения
    if not args.subject:
        confirm = input("\n⚠️  Вы уверены, что хотите удалить ВСЕ данные? (введите 'да'): ")
        if confirm.lower() != 'да':
            print("❌ Отменено")
            return
    
    # Очистка
    clean_database(str(db_path), args.subject)
    clean_images(str(images_dir), args.subject)
    
    print("\n✅ Очистка завершена!")


if __name__ == '__main__':
    main()


