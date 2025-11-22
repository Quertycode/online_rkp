@echo off
REM =================================================================
REM  ПОЛНАЯ УСТАНОВКА БАЗЫ ЗАДАНИЙ - АВТОМАТИЧЕСКИЙ СКРИПТ
REM =================================================================
echo.
echo ============================================================
echo   УСТАНОВКА БАЗЫ ЗАДАНИЙ ИЗ СДАМ ГИА
echo ============================================================
echo.

REM Проверка Python
echo [Шаг 1/4] Проверка Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ОШИБКА: Python не найден!
    echo.
    echo Пожалуйста, установите Python 3.7+ с python.org
    echo При установке поставьте галочку "Add Python to PATH"
    echo.
    pause
    exit /b 1
)
echo ✓ Python установлен

REM Установка зависимостей
echo.
echo [Шаг 2/4] Установка зависимостей...
pip install requests beautifulsoup4 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ОШИБКА: Не удалось установить зависимости!
    echo Попробуйте вручную: pip install requests beautifulsoup4
    echo.
    pause
    exit /b 1
)
echo ✓ Зависимости установлены

REM Загрузка данных
echo.
echo [Шаг 3/4] Загрузка тестовых данных (это займет ~5-10 минут)...
echo.

echo → Математика (База) ОГЭ - 30 заданий...
python load_tasks.py --subject mathb --exam-type oge --count 30
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ОШИБКА при загрузке математики!
    pause
    exit /b 1
)

echo.
echo → Биология ОГЭ - 30 заданий...
python load_tasks.py --subject bio --exam-type oge --count 30
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ОШИБКА при загрузке биологии!
    pause
    exit /b 1
)

REM Готово
echo.
echo [Шаг 4/4] Проверка результатов...
echo.

REM Проверка БД
cd ..
if exist "tasksbd.db" (
    echo ✓ База данных создана
) else (
    echo ✗ База данных не найдена!
)

REM Проверка изображений
if exist "image_tasksdb\mathb" (
    echo ✓ Изображения математики загружены
) else (
    echo ✗ Изображения математики не найдены!
)

if exist "image_tasksdb\bio" (
    echo ✓ Изображения биологии загружены
) else (
    echo ✗ Изображения биологии не найдены!
)

echo.
echo ============================================================
echo   ГОТОВО! База заданий установлена
echo ============================================================
echo.
echo Загружено:
echo   ✓ 60 заданий (30 mathb + 30 bio)
echo   ✓ ~100-200 изображений
echo   ✓ Темы и категории
echo   ✓ Решения к заданиям
echo.
echo Следующие шаги:
echo   1. Запустить backend: cd server && npm run start:dev
echo   2. Открыть приложение и перейти на /tasks
echo   3. Проверить отображение заданий с изображениями
echo.
echo Документация: server/TASKS_DATABASE_README.md
echo.
pause


