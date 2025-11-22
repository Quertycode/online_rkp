/**
 * Скрипт для загрузки данных из СДАМ ГИА API в базу данных
 * 
 * Особенности:
 * - Скачивает изображения локально в папку image_tasksdb
 * - Сохраняет пути к локальным изображениям в БД
 * - Включает ссылки на изображения в текст задачи и решения
 * - Сохраняет линию заданий
 */

import * as Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import * as http from 'http'

// SdamGIA должен быть передан извне (например, из Python скрипта или через другой интерфейс)
// Тип для совместимости
interface SdamGIA {
  get_problem_by_id(subjectCode: string, problemId: string): ProblemData
  get_catalog(subjectCode: string): any[]
}

// Абсолютный путь к БД в папке server
const DB_PATH = path.resolve(__dirname, '../tasksbd.db')
// Путь к папке с изображениями
const IMAGES_DIR = path.resolve(__dirname, '../image_tasksdb')

interface ProblemData {
  id: string
  topic: string
  condition: { text: string; images: string[] }
  solution: { text: string; images: string[] }
  answer: string
  analogs: string[]
  url: string
}

/**
 * Скачивает изображение по URL и сохраняет локально
 */
async function downloadImage(imageUrl: string, savePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Определяем протокол
    const protocol = imageUrl.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(savePath)
    
    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Редирект
        return downloadImage(response.headers.location!, savePath)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(savePath)
        reject(new Error(`Ошибка загрузки: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(savePath)) {
        fs.unlinkSync(savePath)
      }
      reject(err)
    })
  })
}

/**
 * Скачивает изображение и возвращает локальный путь
 */
async function downloadAndSaveImage(
  imageUrl: string,
  subjectCode: string,
  problemId: string,
  imageType: 'condition' | 'solution',
  imageIndex: number
): Promise<string> {
  // Создаем структуру папок: image_tasksdb/{subject}/{problem_id}/
  const subjectDir = path.join(IMAGES_DIR, subjectCode)
  const problemDir = path.join(subjectDir, problemId)
  
  if (!fs.existsSync(problemDir)) {
    fs.mkdirSync(problemDir, { recursive: true })
  }
  
  // Определяем расширение файла из URL
  const urlPath = new URL(imageUrl).pathname
  const ext = path.extname(urlPath) || '.png'
  const filename = `${imageType}_${imageIndex}${ext}`
  const localPath = path.join(problemDir, filename)
  
  // Скачиваем изображение
  await downloadImage(imageUrl, localPath)
  
  // Возвращаем относительный путь от папки server
  return path.relative(path.resolve(__dirname, '..'), localPath).replace(/\\/g, '/')
}

/**
 * Добавляет или обновляет предмет в БД
 */
function upsertSubject(
  db: Database.Database,
  code: string,
  name: string,
  examType: 'oge' | 'ege' = 'oge'
): number {
  const existing = db
    .prepare('SELECT id FROM subjects WHERE code = ? AND exam_type = ?')
    .get(code, examType) as { id: number } | undefined

  if (existing) {
    return existing.id
  }

  const result = db
    .prepare('INSERT INTO subjects (code, name, exam_type) VALUES (?, ?, ?)')
    .run(code, name, examType)

  return Number(result.lastInsertRowid)
}

/**
 * Добавляет или обновляет задание (topic) в БД
 */
function upsertTopic(
  db: Database.Database,
  subjectId: number,
  topicNumber: string,
  topicName: string,
  topicLine?: string
): number {
  const existing = db
    .prepare('SELECT id FROM topics WHERE subject_id = ? AND topic_number = ?')
    .get(subjectId, topicNumber) as { id: number } | undefined

  if (existing) {
    // Обновляем название и линию, если изменилось
    db.prepare('UPDATE topics SET topic_name = ?, topic_line = ? WHERE id = ?').run(
      topicName,
      topicLine || null,
      existing.id
    )
    return existing.id
  }

  const result = db
    .prepare(
      'INSERT INTO topics (subject_id, topic_number, topic_name, topic_line) VALUES (?, ?, ?, ?)'
    )
    .run(subjectId, topicNumber, topicName, topicLine || null)

  return Number(result.lastInsertRowid)
}

/**
 * Добавляет или обновляет категорию в БД
 */
function upsertCategory(
  db: Database.Database,
  topicId: number,
  categoryId: string,
  categoryName: string
): number {
  const existing = db
    .prepare('SELECT id FROM categories WHERE topic_id = ? AND category_id = ?')
    .get(topicId, categoryId) as { id: number } | undefined

  if (existing) {
    db.prepare('UPDATE categories SET category_name = ? WHERE id = ?').run(
      categoryName,
      existing.id
    )
    return existing.id
  }

  const result = db
    .prepare(
      'INSERT INTO categories (topic_id, category_id, category_name) VALUES (?, ?, ?)'
    )
    .run(topicId, categoryId, categoryName)

  return Number(result.lastInsertRowid)
}

/**
 * Добавляет или обновляет задачу в БД
 */
function upsertProblem(
  db: Database.Database,
  subjectId: number,
  topicId: number | null,
  problemId: string,
  line: string | null,
  conditionText: string,
  solutionText: string,
  answer: string,
  url: string
): number {
  const existing = db
    .prepare('SELECT id FROM problems WHERE subject_id = ? AND problem_id = ?')
    .get(subjectId, problemId) as { id: number } | undefined

  if (existing) {
    // Обновляем существующую задачу
    db.prepare(
      `UPDATE problems 
       SET topic_id = ?, line = ?, condition_text = ?, solution_text = ?, answer = ?, url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      topicId,
      line,
      conditionText,
      solutionText,
      answer,
      url,
      existing.id
    )
    return existing.id
  }

  const result = db
    .prepare(
      `INSERT INTO problems 
       (subject_id, topic_id, problem_id, line, condition_text, solution_text, answer, url, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sdamgia')`
    )
    .run(
      subjectId,
      topicId,
      problemId,
      line,
      conditionText,
      solutionText,
      answer,
      url
    )

  return Number(result.lastInsertRowid)
}

/**
 * Добавляет изображения условий задачи (скачивает и сохраняет локально)
 */
async function insertConditionImages(
  db: Database.Database,
  problemId: number,
  problemIdStr: string,
  subjectCode: string,
  images: string[]
): Promise<void> {
  // Удаляем старые изображения
  db.prepare('DELETE FROM problem_condition_images WHERE problem_id = ?').run(problemId)

  if (images.length === 0) return

  // Скачиваем и сохраняем изображения
  const stmt = db.prepare(
    'INSERT INTO problem_condition_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
  )

  for (let index = 0; index < images.length; index++) {
    try {
      const imageUrl = images[index]
      const localPath = await downloadAndSaveImage(
        imageUrl,
        subjectCode,
        problemIdStr,
        'condition',
        index
      )
      stmt.run(problemId, imageUrl, localPath, index)
    } catch (error) {
      console.warn(`⚠️  Не удалось скачать изображение условия ${images[index]}:`, error)
      // Сохраняем только URL, если не удалось скачать
      stmt.run(problemId, images[index], images[index], index)
    }
  }
}

/**
 * Добавляет изображения решений задачи (скачивает и сохраняет локально)
 */
async function insertSolutionImages(
  db: Database.Database,
  problemId: number,
  problemIdStr: string,
  subjectCode: string,
  images: string[]
): Promise<void> {
  // Удаляем старые изображения
  db.prepare('DELETE FROM problem_solution_images WHERE problem_id = ?').run(problemId)

  if (images.length === 0) return

  // Скачиваем и сохраняем изображения
  const stmt = db.prepare(
    'INSERT INTO problem_solution_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
  )

  for (let index = 0; index < images.length; index++) {
    try {
      const imageUrl = images[index]
      const localPath = await downloadAndSaveImage(
        imageUrl,
        subjectCode,
        problemIdStr,
        'solution',
        index
      )
      stmt.run(problemId, imageUrl, localPath, index)
    } catch (error) {
      console.warn(`⚠️  Не удалось скачать изображение решения ${images[index]}:`, error)
      // Сохраняем только URL, если не удалось скачать
      stmt.run(problemId, images[index], images[index], index)
    }
  }
}

/**
 * Формирует текст с встроенными изображениями
 */
function formatTextWithImages(
  text: string,
  images: Array<{ path: string; order: number }>
): string {
  if (images.length === 0) return text

  // Сортируем изображения по порядку
  const sortedImages = [...images].sort((a, b) => a.order - b.order)

  // Добавляем изображения в конец текста
  let result = text
  if (result && !result.endsWith('\n')) {
    result += '\n\n'
  }

  sortedImages.forEach((img, index) => {
    result += `\n![Изображение ${index + 1}](${img.path})\n`
  })

  return result
}

/**
 * Добавляет аналогичные задачи
 */
function insertAnalogs(
  db: Database.Database,
  problemId: number,
  analogProblemIds: string[],
  subjectId: number
): void {
  // Удаляем старые аналоги
  db.prepare('DELETE FROM problem_analogs WHERE problem_id = ?').run(problemId)

  if (analogProblemIds.length === 0) return

  // Находим ID аналогичных задач
  const stmt = db.prepare(
    `INSERT INTO problem_analogs (problem_id, analog_problem_id)
     SELECT ?, p.id
     FROM problems p
     WHERE p.subject_id = ? AND p.problem_id = ?`
  )

  analogProblemIds.forEach((analogId) => {
    try {
      stmt.run(problemId, subjectId, analogId)
    } catch (error) {
      // Игнорируем ошибки, если аналогичная задача еще не загружена
      console.warn(`Аналогичная задача ${analogId} не найдена в БД`)
    }
  })
}

/**
 * Связывает задачу с категорией
 */
function linkProblemToCategory(
  db: Database.Database,
  problemId: number,
  categoryId: number
): void {
  try {
    db.prepare(
      'INSERT OR IGNORE INTO category_problems (category_id, problem_id) VALUES (?, ?)'
    ).run(categoryId, problemId)
  } catch (error) {
    console.warn(`Не удалось связать задачу ${problemId} с категорией ${categoryId}:`, error)
  }
}

/**
 * Находит категорию по topic_id и category_id из СДАМ ГИА
 */
function findCategoryBySdamgiaId(
  db: Database.Database,
  topicId: number,
  sdamgiaCategoryId: string
): number | null {
  const category = db
    .prepare('SELECT id FROM categories WHERE topic_id = ? AND category_id = ?')
    .get(topicId, sdamgiaCategoryId) as { id: number } | undefined

  return category?.id || null
}

/**
 * Связывает задачу со всеми категориями из topic
 */
function linkProblemToTopicCategories(
  db: Database.Database,
  problemId: number,
  topicId: number | null
): void {
  if (!topicId) return

  // Находим все категории этого topic и связываем с задачей
  const categories = db
    .prepare('SELECT id FROM categories WHERE topic_id = ?')
    .all(topicId) as Array<{ id: number }>

  categories.forEach((category) => {
    linkProblemToCategory(db, problemId, category.id)
  })
}

/**
 * Получает линию задания из topic_line
 */
function getLineFromTopic(
  db: Database.Database,
  topicId: number | null
): string | null {
  if (!topicId) return null

  const topic = db
    .prepare('SELECT topic_line FROM topics WHERE id = ?')
    .get(topicId) as { topic_line: string | null } | undefined

  return topic?.topic_line || null
}

/**
 * Загружает задачу из СДАМ ГИА API в БД
 */
async function importProblem(
  db: Database.Database,
  sdamgia: SdamGIA,
  subjectCode: string,
  subjectName: string,
  problemId: string,
  examType: 'oge' | 'ege' = 'oge',
  topicLine?: string
): Promise<void> {
  try {
    // Получаем данные задачи из API
    const problemData = sdamgia.get_problem_by_id(subjectCode, problemId) as ProblemData

    if (!problemData) {
      console.warn(`Задача ${problemId} не найдена`)
      return
    }

    // Сначала скачиваем все изображения (асинхронные операции)
    const conditionImagePaths: Array<{ path: string; order: number }> = []
    if (problemData.condition.images.length > 0) {
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

    const solutionImagePaths: Array<{ path: string; order: number }> = []
    if (problemData.solution.images.length > 0) {
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

    // Формируем текст с встроенными изображениями
    const conditionText = formatTextWithImages(
      problemData.condition.text,
      conditionImagePaths
    )
    const solutionText = formatTextWithImages(
      problemData.solution.text,
      solutionImagePaths
    )

    // Теперь выполняем транзакцию БД (синхронные операции)
    const transaction = db.transaction(() => {
      // Добавляем предмет
      const subjectId = upsertSubject(db, subjectCode, subjectName, examType)

      // Добавляем задание (topic), если есть
      let topicId: number | null = null
      let line: string | null = topicLine || null

      if (problemData.topic) {
        // Получаем информацию о задании из каталога, если возможно
        try {
          const catalog = sdamgia.get_catalog(subjectCode)
          const topicInfo = catalog.find((t) => t.topic_id === problemData.topic)
          
          if (topicInfo) {
            topicId = upsertTopic(
              db,
              subjectId,
              problemData.topic,
              topicInfo.topic_name,
              topicInfo.topic_line || undefined
            )
            // Если линия не была передана, берем из topic
            if (!line && topicInfo.topic_line) {
              line = topicInfo.topic_line
            }
          } else {
            topicId = upsertTopic(
              db,
              subjectId,
              problemData.topic,
              `Задание ${problemData.topic}`,
              topicLine
            )
          }
        } catch (error) {
          // Если не удалось получить каталог, создаем topic без линии
          topicId = upsertTopic(
            db,
            subjectId,
            problemData.topic,
            `Задание ${problemData.topic}`,
            topicLine
          )
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
        problemData.answer,
        problemData.url
      )

      // Сохраняем изображения в БД
      if (conditionImagePaths.length > 0) {
        const stmt = db.prepare(
          'INSERT INTO problem_condition_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
        )
        problemData.condition.images.forEach((url, index) => {
          const localPath = conditionImagePaths.find((img) => img.order === index)?.path || url
          stmt.run(dbProblemId, url, localPath, index)
        })
      }

      if (solutionImagePaths.length > 0) {
        const stmt = db.prepare(
          'INSERT INTO problem_solution_images (problem_id, image_url, image_path, image_order) VALUES (?, ?, ?, ?)'
        )
        problemData.solution.images.forEach((url, index) => {
          const localPath = solutionImagePaths.find((img) => img.order === index)?.path || url
          stmt.run(dbProblemId, url, localPath, index)
        })
      }

      // Добавляем аналогичные задачи
      if (problemData.analogs.length > 0) {
        insertAnalogs(db, dbProblemId, problemData.analogs, subjectId)
      }

      // Связываем задачу со всеми категориями из topic (если topic известен)
      if (topicId) {
        linkProblemToTopicCategories(db, dbProblemId, topicId)
      }
    })

    // Выполняем транзакцию
    transaction()

    console.log(`✅ Задача ${problemId} успешно импортирована`)
  } catch (error) {
    console.error(`❌ Ошибка при импорте задачи ${problemId}:`, error)
    throw error
  }
}

/**
 * Загружает каталог заданий из СДАМ ГИА API в БД
 */
async function importCatalog(
  db: Database.Database,
  sdamgia: SdamGIA,
  subjectCode: string,
  subjectName: string,
  examType: 'oge' | 'ege' = 'oge'
): Promise<void> {
  try {
    const catalog = sdamgia.get_catalog(subjectCode)

    db.transaction(() => {
      const subjectId = upsertSubject(db, subjectCode, subjectName, examType)

      catalog.forEach((topic) => {
        const topicId = upsertTopic(
          db,
          subjectId,
          topic.topic_id,
          topic.topic_name,
          topic.topic_line || undefined
        )

        topic.categories.forEach((category) => {
          upsertCategory(db, topicId, category.category_id, category.category_name)
        })
      })
    })()

    console.log(`✅ Каталог для ${subjectCode} успешно импортирован`)
  } catch (error) {
    console.error(`❌ Ошибка при импорте каталога ${subjectCode}:`, error)
    throw error
  }
}

/**
 * Пример использования
 * 
 * ВАЖНО: Этот пример требует объект SdamGIA из Python модуля.
 * Используйте load-tasks.ts для реальной загрузки данных.
 */
/*
async function example() {
  // Создаем папку для изображений, если её нет
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
    console.log(`📁 Создана папка для изображений: ${IMAGES_DIR}`)
  }

  const db = new Database(DB_PATH)
  // SdamGIA должен быть создан через Python интерфейс
  // const sdamgia = createSdamGIAFromPython()

  try {
    // Импортируем каталог
    // await importCatalog(db, sdamgia, 'math', 'Математика', 'oge')

    // Импортируем несколько задач
    // await importProblem(db, sdamgia, 'math', 'Математика', '1001', 'oge')
    // await importProblem(db, sdamgia, 'math', 'Математика', '1002', 'oge')
  } finally {
    db.close()
  }
}
*/

export {
  importProblem,
  importCatalog,
  upsertSubject,
  upsertTopic,
  upsertCategory,
  upsertProblem,
  downloadAndSaveImage,
  formatTextWithImages,
  linkProblemToCategory,
  linkProblemToTopicCategories,
  findCategoryBySdamgiaId,
}
