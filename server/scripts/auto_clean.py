# -*- coding: utf-8 -*-
"""
Автоматическая очистка БД и изображений без подтверждения
"""

import sys
import os
from pathlib import Path

# Добавляем путь к модулю
sys.path.insert(0, str(Path(__file__).parent))

from clean_db import clean_database, clean_images

# Пути
script_dir = Path(__file__).parent
db_path = script_dir / '../tasksbd.db'
images_dir = script_dir / '../image_tasksdb'

print("=" * 60)
print("ОЧИСТКА БАЗЫ ДАННЫХ И ИЗОБРАЖЕНИЙ")
print("=" * 60)
print(f"БД: {db_path}")
print(f"Папка изображений: {images_dir}")
print("=" * 60)

# Очистка
clean_database(str(db_path), None)
clean_images(str(images_dir), None)

print("\nОчистка завершена!")


