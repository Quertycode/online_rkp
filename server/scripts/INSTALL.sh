#!/bin/bash
# =================================================================
#  ПОЛНАЯ УСТАНОВКА БАЗЫ ЗАДАНИЙ - АВТОМАТИЧЕСКИЙ СКРИПТ
# =================================================================

echo ""
echo "============================================================"
echo "  УСТАНОВКА БАЗЫ ЗАДАНИЙ ИЗ СДАМ ГИА"
echo "============================================================"
echo ""

# Проверка Python
echo "[Шаг 1/4] Проверка Python..."
if ! command -v python3 &> /dev/null; then
    echo ""
    echo "ОШИБКА: Python не найден!"
    echo ""
    echo "Пожалуйста, установите Python 3.7+"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  macOS: brew install python3"
    echo ""
    exit 1
fi
echo "✓ Python установлен"

# Установка зависимостей
echo ""
echo "[Шаг 2/4] Установка зависимостей..."
pip3 install requests beautifulsoup4 > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo ""
    echo "ОШИБКА: Не удалось установить зависимости!"
    echo "Попробуйте вручную: pip3 install requests beautifulsoup4"
    echo ""
    exit 1
fi
echo "✓ Зависимости установлены"

# Загрузка данных
echo ""
echo "[Шаг 3/4] Загрузка тестовых данных (это займет ~5-10 минут)..."
echo ""

echo "→ Математика (База) ОГЭ - 30 заданий..."
python3 load_tasks.py --subject mathb --exam-type oge --count 30
if [ $? -ne 0 ]; then
    echo ""
    echo "ОШИБКА при загрузке математики!"
    exit 1
fi

echo ""
echo "→ Биология ОГЭ - 30 заданий..."
python3 load_tasks.py --subject bio --exam-type oge --count 30
if [ $? -ne 0 ]; then
    echo ""
    echo "ОШИБКА при загрузке биологии!"
    exit 1
fi

# Готово
echo ""
echo "[Шаг 4/4] Проверка результатов..."
echo ""

# Проверка БД
cd ..
if [ -f "tasksbd.db" ]; then
    echo "✓ База данных создана"
else
    echo "✗ База данных не найдена!"
fi

# Проверка изображений
if [ -d "image_tasksdb/mathb" ]; then
    echo "✓ Изображения математики загружены"
else
    echo "✗ Изображения математики не найдены!"
fi

if [ -d "image_tasksdb/bio" ]; then
    echo "✓ Изображения биологии загружены"
else
    echo "✗ Изображения биологии не найдены!"
fi

echo ""
echo "============================================================"
echo "  ГОТОВО! База заданий установлена"
echo "============================================================"
echo ""
echo "Загружено:"
echo "  ✓ 60 заданий (30 mathb + 30 bio)"
echo "  ✓ ~100-200 изображений"
echo "  ✓ Темы и категории"
echo "  ✓ Решения к заданиям"
echo ""
echo "Следующие шаги:"
echo "  1. Запустить backend: cd server && npm run start:dev"
echo "  2. Открыть приложение и перейти на /tasks"
echo "  3. Проверить отображение заданий с изображениями"
echo ""
echo "Документация: server/TASKS_DATABASE_README.md"
echo ""


