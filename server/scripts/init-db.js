/**
 * Инициализация базы данных
 * 
 * Запуск: node init-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Путь к БД
const dbPath = path.join(__dirname, '..', 'tasksbd.db');
console.log('Создание базы данных:', dbPath);

// Удаляем старую БД если есть
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ Старая БД удалена');
}

// Создаем новую БД
const db = new Database(dbPath);

// Читаем SQL скрипт
const sqlPath = path.join(__dirname, '..', 'database', 'init.sql');
const sqlScript = fs.readFileSync(sqlPath, 'utf-8');

// Выполняем SQL скрипт
db.exec(sqlScript);

console.log('✅ База данных создана успешно!');

// Проверяем таблицы
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nСозданные таблицы:');
tables.forEach(table => console.log('  -', table.name));

db.close();


