/**
 * Скрипт для загрузки заданий из СДАМ ГИА в БД
 * Загружает по 20 заданий для биологии ОГЭ и математики базы ОГЭ
 */

import * as Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'

// Пути
const DB_PATH = path.resolve(__dirname, '../tasksbd.db')
const IMAGES_DIR = path.resolve(__dirname, '../image_tasksdb')
const PYTHON_SCRIPT = path.resolve(__dirname, '../../sdamgia-api')

// Проверяем, что БД существует
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ База данных не найдена! Сначала создайте БД: npm run db:init')
  process.exit(1)
}

// Создаем папку для изображений, если её нет
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
  console.log(`📁 Создана папка для изображений: ${IMAGES_DIR}`)
}

/**
 * Выполняет Python скрипт для получения данных из СДАМ ГИА
 */
function runPythonScript(script: string, args: string[] = []): any {
  try {
    const pythonCode = `
import sys
sys.path.insert(0, r'${PYTHON_SCRIPT.replace(/\\/g, '/')}')
from sdamgia import SdamGIA
import json

sdamgia = SdamGIA()
${script}
print(json.dumps(result, ensure_ascii=False))
`
    const result = execSync(`python -c "${pythonCode.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      cwd: __dirname,
    })
    return JSON.parse(result.trim())
  } catch (error: any) {
    console.error('Ошибка выполнения Python скрипта:', error.message)
    throw error
  }
}

/**
 * Получает каталог предмета
 */
function getCatalog(subjectCode: string): any[] {
  const script = `result = sdamgia.get_catalog('${subjectCode}')`
  return runPythonScript(script)
}

/**
 * Получает задачу по ID
 */
function getProblem(subjectCode: string, problemId: string): any {
  const script = `result = sdamgia.get_problem_by_id('${subjectCode}', '${problemId}')`
  return runPythonScript(script)
}

/**
 * Ищет задачи по запросу
 */
function searchProblems(subjectCode: string, query: string, page: number = 1): string[] {
  const script = `result = sdamgia.search('${subjectCode}', '${query}', ${page})`
  return runPythonScript(script)
}

/**
 * Получает задачи из категории
 */
function getCategoryProblems(subjectCode: string, categoryId: string, page: number = 1): string[] {
  const script = `result = sdamgia.get_category_by_id('${subjectCode}', '${categoryId}', ${page})`
  return runPythonScript(script)
}

/**
 * Импортирует задачу используя существующие функции из example-import.ts
 */
async function importProblemFromPython(
  db: Database.Database,
  subjectCode: string,
  subjectName: string,
  problemId: string,
  examType: 'oge' | 'ege' = 'oge',
  topicLine?: string
): Promise<void> {
  // Импортируем функции из example-import.ts
  const { importProblem } = await import('./example-import')
  
  // Создаем mock объект SdamGIA для использования с существующими функциями
  // Но нам нужно использовать Python API напрямую
  const problemData = getProblem(subjectCode, problemId)
  
  if (!problemData) {
    console.warn(`⚠️  Задача ${problemId} не найдена`)
    return
  }

  // Используем существующие функции импорта
  // Но нужно адаптировать под Python API
  console.log(`📥 Загружаем задачу ${problemId}...`)
  
  // Здесь нужно использовать функции из example-import.ts
  // Но они ожидают объект SdamGIA, а у нас Python API
  // Поэтому создадим упрощенную версию импорта
}

/**
 * Упрощенная функция импорта задачи напрямую
 */
async function importProblemDirect(
  db: Database.Database,
  subjectCode: string,
  subjectName: string,
  problemId: string,
  examType: 'oge' | 'ege' = 'oge'
): Promise<void> {
  try {
    console.log(`📥 Загружаем задачу ${problemId} (${subjectCode})...`)
    
    // Получаем данные задачи из Python API
    const problemData = getProblem(subjectCode, problemId)
    
    if (!problemData) {
      console.warn(`⚠️  Задача ${problemId} не найдена`)
      return
    }

    // Импортируем функции из example-import.ts
    const {
      upsertSubject,
      upsertTopic,
      upsertProblem,
      downloadAndSaveImage,
      formatTextWithImages,
      linkProblemToTopicCategories,
    } = await import('./example-import')

    // Скачиваем изображения условий
    const conditionImagePaths: Array<{ path: string; order: number }> = []
    if (problemData.condition?.images?.length > 0) {
      for (let i = 0; i < problemData.condition.images.length; i++) {
        try {
          const localPath = await downloadAndSaveImage(
            problemData.condition.images[i],
            subjectCode,
            problemId,
            'condition',
            i
          )
          conditionImagePaths.push({ path: localPath, order: i })
        } catch (error) {
          console.warn(`⚠️  Не удалось скачать изображение условия:`, error)
        }
      }
    }

    // Скачиваем изображения решений
    const solutionImagePaths: Array<{ path: string; order: number }> = []
    if (problemData.solution?.images?.length > 0) {
      for (let i = 0; i < problemData.solution.images.length; i++) {
        try {
          const localPath = await downloadAndSaveImage(
            problemData.solution.images[i],
            subjectCode,
            problemId,
            'solution',
            i
          )
          solutionImagePaths.push({ path: localPath, order: i })
        } catch (error) {
          console.warn(`⚠️  Не удалось скачать изображение решения:`, error)
        }
      }
    }

    // Формируем текст с изображениями
    const conditionText = formatTextWithImages(
      problemData.condition?.text || '',
      conditionImagePaths
    )
    const solutionText = formatTextWithImages(
      problemData.solution?.text || '',
      solutionImagePaths
    )

    // Сохраняем в БД
    const transaction = db.transaction(() => {
      const subjectId = upsertSubject(db, subjectCode, subjectName, examType)

      let topicId: number | null = null
      let line: string | null = null

      // Получаем информацию о topic из каталога
      if (problemData.topic) {
        try {
          const catalog = getCatalog(subjectCode)
          const topicInfo = catalog.find((t: any) => t.topic_id === problemData.topic)
          
          if (topicInfo) {
            topicId = upsertTopic(
              db,
              subjectId,
              problemData.topic,
              topicInfo.topic_name,
              topicInfo.topic_line || undefined
            )
            if (topicInfo.topic_line) {
              line = topicInfo.topic_line
            }
          } else {
            topicId = upsertTopic(db, subjectId, problemData.topic, `Задание ${problemData.topic}`)
          }
        } catch (error) {
          topicId = upsertTopic(db, subjectId, problemData.topic, `Задание ${problemData.topic}`)
        }
      }

      // Добавляем задачу
      const dbProblemId = upsertProblem(
        db,
        subjectId,
        topicId,
        problemId,
        line,
        conditionText,
        solutionText,
        problemData.answer || '',
        problemData.url || ''
      )

      // Сохраняем изображения
      if (conditionImagePaths.length > 0) {
        const stmt = db.prepare(
          'INSERT INTO problem_condition_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
        )
        problemData.condition.images.forEach((url: string, index: number) => {
          const localPath = conditionImagePaths.find((img) => img.order === index)?.path || url
          stmt.run(dbProblemId, url, localPath, index)
        })
      }

      if (solutionImagePaths.length > 0) {
        const stmt = db.prepare(
          'INSERT INTO problem_solution_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
        )
        problemData.solution.images.forEach((url: string, index: number) => {
          const localPath = solutionImagePaths.find((img) => img.order === index)?.path || url
          stmt.run(dbProblemId, url, localPath, index)
        })
      }

      // Связываем с категориями
      if (topicId) {
        linkProblemToTopicCategories(db, dbProblemId, topicId)
      }

      // Сохраняем аналогичные задачи
      if (problemData.analogs?.length > 0) {
        const stmt = db.prepare(
          `INSERT OR IGNORE INTO problem_analogs (problem_id, analog_problem_id)
           SELECT ?, p.id
           FROM problems p
           WHERE p.subject_id = ? AND p.problem_id = ?`
        )
        problemData.analogs.forEach((analogId: string) => {
          try {
            stmt.run(dbProblemId, subjectId, analogId)
          } catch (error) {
            // Игнорируем, если аналогичная задача еще не загружена
          }
        })
      }
    })

    transaction()
    console.log(`✅ Задача ${problemId} успешно импортирована`)
  } catch (error) {
    console.error(`❌ Ошибка при импорте задачи ${problemId}:`, error)
    throw error
  }
}

/**
 * Загружает каталог предмета
 */
async function loadCatalog(
  db: Database.Database,
  subjectCode: string,
  subjectName: string,
  examType: 'oge' | 'ege' = 'oge'
): Promise<void> {
  const { importCatalog } = await import('./example-import')
  
  // Создаем mock объект для importCatalog
  const catalog = getCatalog(subjectCode)
  
  // Используем существующую функцию, но нужно адаптировать
  // Пока используем прямое сохранение
  const { upsertSubject, upsertTopic, upsertCategory } = await import('./example-import')
  
  const transaction = db.transaction(() => {
    const subjectId = upsertSubject(db, subjectCode, subjectName, examType)

    catalog.forEach((topic: any) => {
      const topicId = upsertTopic(
        db,
        subjectId,
        topic.topic_id,
        topic.topic_name,
        topic.topic_line || undefined
      )

      topic.categories?.forEach((category: any) => {
        upsertCategory(db, topicId, category.category_id, category.category_name)
      })
    })
  })

  transaction()
  console.log(`✅ Каталог для ${subjectCode} загружен`)
}

/**
 * Получает список ID задач для загрузки
 */
function getProblemIds(subjectCode: string, count: number): string[] {
  // Сначала загружаем каталог
  const catalog = getCatalog(subjectCode)
  
  const problemIds: string[] = []
  
  // Берем задачи из разных категорий
  for (const topic of catalog.slice(0, 5)) { // Берем первые 5 заданий
    if (problemIds.length >= count) break
    
    for (const category of topic.categories?.slice(0, 2) || []) { // По 2 категории из каждого задания
      if (problemIds.length >= count) break
      
      try {
        const categoryProblems = getCategoryProblems(subjectCode, category.category_id, 1)
        // Берем первые несколько задач из категории
        const toAdd = Math.min(4, count - problemIds.length, categoryProblems.length)
        problemIds.push(...categoryProblems.slice(0, toAdd))
      } catch (error) {
        console.warn(`⚠️  Не удалось получить задачи из категории ${category.category_id}`)
      }
    }
  }
  
  return problemIds.slice(0, count)
}

/**
 * Основная функция загрузки
 */
async function main() {
  console.log('🚀 Начинаем загрузку заданий в БД...\n')

  const db = new Database(DB_PATH)

  try {
    // 1. Загружаем каталоги
    console.log('📚 Загружаем каталоги...')
    await loadCatalog(db, 'bio', 'Биология', 'oge')
    await loadCatalog(db, 'mathb', 'Математика база', 'oge')
    console.log('')

    // 2. Загружаем задачи по биологии
    console.log('🔬 Загружаем задачи по биологии ОГЭ (20 заданий)...')
    const bioProblemIds = getProblemIds('bio', 20)
    console.log(`Найдено ${bioProblemIds.length} задач для загрузки`)
    
    for (const problemId of bioProblemIds) {
      await importProblemDirect(db, 'bio', 'Биология', problemId, 'oge')
    }
    console.log('')

    // 3. Загружаем задачи по математике базе
    console.log('🔢 Загружаем задачи по математике базе ОГЭ (20 заданий)...')
    const mathbProblemIds = getProblemIds('mathb', 20)
    console.log(`Найдено ${mathbProblemIds.length} задач для загрузки`)
    
    for (const problemId of mathbProblemIds) {
      await importProblemDirect(db, 'mathb', 'Математика база', problemId, 'oge')
    }
    console.log('')

    // 4. Статистика
    const bioCount = db.prepare('SELECT COUNT(*) as count FROM problems p JOIN subjects s ON p.subject_id = s.id WHERE s.code = ? AND s.exam_type = ?').get('bio', 'oge') as { count: number }
    const mathbCount = db.prepare('SELECT COUNT(*) as count FROM problems p JOIN subjects s ON p.subject_id = s.id WHERE s.code = ? AND s.exam_type = ?').get('mathb', 'oge') as { count: number }
    
    console.log('\n📊 Статистика загрузки:')
    console.log(`   Биология ОГЭ: ${bioCount.count} задач`)
    console.log(`   Математика база ОГЭ: ${mathbCount.count} задач`)
    console.log(`   Всего: ${bioCount.count + mathbCount.count} задач`)

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Запускаем загрузку
main().catch(console.error)


