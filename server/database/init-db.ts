import * as Database from 'better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Скрипт инициализации базы данных для банка заданий
 * Создает БД и все необходимые таблицы
 */

// Абсолютный путь к БД в папке server
const DB_PATH = path.resolve(__dirname, '../tasksbd.db')
const SCHEMA_PATH = path.join(__dirname, 'schema.sql')

function initDatabase() {
  console.log('🚀 Инициализация базы данных банка заданий...')
  
  // Проверяем существование файла БД
  const dbExists = fs.existsSync(DB_PATH)
  
  if (dbExists) {
    console.log(`⚠️  База данных уже существует: ${DB_PATH}`)
    console.log('   Для пересоздания удалите файл tasksbd.db вручную')
    return
  }

  // Создаем директорию, если её нет
  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  // Читаем схему SQL
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Файл схемы не найден: ${SCHEMA_PATH}`)
  }

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')

  // Создаем подключение к БД
  const db = new Database(DB_PATH)
  
  try {
    // Выполняем схему
    db.exec(schema)
    
    console.log('✅ База данных успешно создана!')
    console.log(`📁 Путь: ${DB_PATH}`)
    
    // Выводим информацию о созданных таблицах
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as Array<{ name: string }>
    
    console.log(`\n📊 Создано таблиц: ${tables.length}`)
    tables.forEach((table) => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number }
      console.log(`   - ${table.name} (${count.count} записей)`)
    })
    
  } catch (error) {
    console.error('❌ Ошибка при создании базы данных:', error)
    throw error
  } finally {
    db.close()
  }
}

// Запускаем инициализацию, если скрипт выполняется напрямую
if (require.main === module) {
  initDatabase()
}

export { initDatabase }

