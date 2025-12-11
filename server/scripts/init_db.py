# -*- coding: utf-8 -*-
"""
Инициализация базы данных
"""

import sqlite3
import sys
from pathlib import Path

# Путь к БД
script_dir = Path(__file__).parent
db_path = script_dir.parent / 'tasksbd.db'

print(f"Создание базы данных: {db_path}")

# Создаем БД
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

# Читаем SQL скрипт
sql_path = script_dir.parent / 'database' / 'init.sql'
with open(sql_path, 'r', encoding='utf-8') as f:
    sql_script = f.read()

# Выполняем SQL скрипт
cursor.executescript(sql_script)
conn.commit()
conn.close()

print("✅ База данных создана успешно!")


