import { Injectable } from '@nestjs/common'
import * as Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class TasksService {
  private db: Database.Database

  constructor() {
    // Путь к базе данных tasksbd.db в папке server
    // В dev: __dirname = server/src/modules/tasks -> ../../tasksbd.db
    // В prod: __dirname = dist/modules/tasks -> ../../tasksbd.db
    const serverPath = path.resolve(__dirname, '../../')
    const dbPathFromServer = path.join(serverPath, 'tasksbd.db')
    
    // Альтернативный путь через process.cwd() (если запускается из папки server)
    const cwdPath = path.join(process.cwd(), 'tasksbd.db')
    
    console.log('Инициализация TasksService')
    console.log('Путь через __dirname:', dbPathFromServer)
    console.log('Путь через process.cwd():', cwdPath)
    
    let dbPath = dbPathFromServer
    try {
      // Проверяем существование файла
      if (!fs.existsSync(dbPathFromServer)) {
        if (fs.existsSync(cwdPath)) {
          dbPath = cwdPath
          console.log('Используется путь через process.cwd()')
        } else {
          throw new Error(`База данных не найдена по путям: ${dbPathFromServer} или ${cwdPath}`)
        }
      }
      
      this.db = new Database(dbPath, { readonly: true })
      console.log('База данных успешно подключена:', dbPath)
    } catch (error) {
      console.error('Ошибка подключения к базе данных:', error)
      throw error
    }
  }

  /**
   * Нормализует код предмета для запроса к БД
   * Преобразует bio_oge -> bio, mathb_oge -> mathb и т.д.
   * В БД коды хранятся без суффикса (bio, mathb)
   */
  private normalizeSubjectCode(subjectCode: string): string {
    // Убираем суффиксы _oge и _ege
    let normalized = subjectCode.replace(/_oge$|_ege$/, '')
    
    // Маппинг для специальных случаев
    const codeMap: Record<string, string> = {
      'russian': 'rus',
      'rus': 'rus',
      'math': 'math', // math остается math
      'mathb': 'mathb', // mathb остается mathb (важно!)
    }
    
    return codeMap[normalized] || normalized
  }

  /**
   * Загружает изображения для задачи
   */
  private getProblemImages(problemId: number): {
    conditionImages: Array<{ path: string; order: number }>
    solutionImages: Array<{ path: string; order: number }>
  } {
    const conditionImages = this.db
      .prepare(`
        SELECT image_path, image_order 
        FROM problem_condition_images 
        WHERE problem_id = ? 
        ORDER BY image_order
      `)
      .all(problemId) as Array<{ image_path: string; image_order: number }>

    const solutionImages = this.db
      .prepare(`
        SELECT image_path, image_order 
        FROM problem_solution_images 
        WHERE problem_id = ? 
        ORDER BY image_order
      `)
      .all(problemId) as Array<{ image_path: string; image_order: number }>

    return {
      conditionImages: conditionImages.map(img => ({
        path: img.image_path,
        order: img.image_order,
      })),
      solutionImages: solutionImages.map(img => ({
        path: img.image_path,
        order: img.image_order,
      })),
    }
  }

  /**
   * Формирует текст с встроенными изображениями
   * Изображения вставляются в текст по их порядку
   */
  private formatTextWithImages(
    text: string,
    images: Array<{ path: string; order: number }>
  ): string {
    if (!text && images.length === 0) return ''
    
    // Если нет изображений, возвращаем текст как есть
    if (images.length === 0) return text || ''

    // Сортируем изображения по порядку
    const sortedImages = [...images].sort((a, b) => a.order - b.order)

    // Разбиваем текст на строки для сохранения переносов
    const lines = (text || '').split('\n')
    
    // Если только одно изображение и много текста, вставляем в конец
    // Если несколько изображений, распределяем их по тексту
    let result = lines.join('\n')
    
    // Вставляем изображения
    sortedImages.forEach((img, index) => {
      // Формируем URL для изображения
      let imagePath = img.path.replace(/\\/g, '/')
      
      // Убираем префикс image_tasksdb/ если он есть
      if (imagePath.startsWith('image_tasksdb/')) {
        imagePath = imagePath.substring('image_tasksdb/'.length)
      }
      
      // Формируем markdown для изображения
      const apiBaseUrl = process.env.API_URL || process.env.FRONTEND_URL?.replace(':5173', ':3001') || 'http://localhost:3001'
      const imageUrl = `${apiBaseUrl}/tasks/images/${imagePath}`
      
      // Вставляем изображение в текст
      // Если текст короткий или это первое изображение, добавляем в конец
      // Если несколько изображений, распределяем
      if (index === 0 && result.trim()) {
        result += `\n\n![img](${imageUrl})`
      } else if (result.trim()) {
        result += `\n![img](${imageUrl})`
      } else {
        result += `![img](${imageUrl})\n`
      }
    })

    return result
  }

  async findAll(subject?: string, topicId?: number, categoryId?: number, topicLine?: string) {
    // JOIN с таблицами subjects, topics для получения названий
    let query = `
      SELECT 
        p.id,
        p.problem_id,
        p.subject_id,
        p.topic_id,
        p.line,
        p.condition_text,
        p.solution_text,
        p.answer,
        p.url,
        p.created_at,
        s.code as subject_code,
        s.name as subject_name,
        t.topic_number,
        t.topic_name,
        t.topic_line
      FROM problems p
      LEFT JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN topics t ON p.topic_id = t.id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (subject && subject !== 'all') {
      // Нормализуем код предмета для запроса к БД
      const normalizedCode = this.normalizeSubjectCode(subject)
      conditions.push('s.code = ?')
      params.push(normalizedCode)
    }

    if (topicId) {
      conditions.push('p.topic_id = ?')
      params.push(topicId)
    }

    if (categoryId) {
      // Для категорий нужен JOIN с category_problems
      query = `
        SELECT DISTINCT
          p.id,
          p.problem_id,
          p.subject_id,
          p.topic_id,
          p.line,
          p.condition_text,
          p.solution_text,
          p.answer,
          p.url,
          p.created_at,
          s.code as subject_code,
          s.name as subject_name,
          t.topic_number,
          t.topic_name,
          t.topic_line
        FROM problems p
        LEFT JOIN subjects s ON p.subject_id = s.id
        LEFT JOIN topics t ON p.topic_id = t.id
        INNER JOIN category_problems cp ON p.id = cp.problem_id
      `
      conditions.push('cp.category_id = ?')
      params.push(categoryId)
    }

    if (topicLine && topicLine !== 'all') {
      // Используем поле line из таблицы problems или topic_line из topics
      // Если еще не добавлен JOIN с topics, добавляем его
      if (!query.includes('LEFT JOIN topics')) {
        query = query.replace(
          'FROM problems p',
          'FROM problems p\n      LEFT JOIN topics t ON p.topic_id = t.id'
        )
      }
      conditions.push('(p.line = ? OR t.topic_line = ?)')
      params.push(topicLine, topicLine)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY p.created_at DESC'

    console.log('Выполнение запроса:', query, 'с параметрами:', params)
    const rows = this.db.prepare(query).all(...params) as any[]
    console.log('Найдено записей в БД:', rows.length)

    // Маппинг кодов БД на коды предметов
    const dbSubjectMap: Record<string, string> = {
      'math': 'math',
      'mathb': 'mathb',
      'russian': 'rus',
      'rus': 'rus',
      'phys': 'phys',
      'inf': 'inf',
      'bio': 'bio',
      'chem': 'chem',
      'geo': 'geo',
      'soc': 'soc',
      'hist': 'hist',
      'lit': 'lit',
      'en': 'en',
      'de': 'de',
      'fr': 'fr',
      'sp': 'sp',
    }

    // Преобразуем данные в формат, совместимый с фронтендом
    return rows.map((row) => {
      // Определяем subject по коду БД
      const subjectName = dbSubjectMap[row.subject_code] || row.subject_code

      // Парсим ответ (может быть строка с разделителями)
      const answers = row.answer 
        ? row.answer.split('|').map((a: string) => a.trim()).filter(Boolean)
        : []

      // Загружаем изображения для задачи
      const images = this.getProblemImages(row.id)
      
      // Проверяем, есть ли уже изображения в тексте (из БД)
      const hasImagesInText = (text: string) => {
        return text && /!\[.*?\]\(.*?\)/.test(text)
      }
      
      // Используем текст как есть если он уже содержит markdown изображения
      // В противном случае добавляем изображения из таблиц
      let question = row.condition_text || ''
      
      if (!hasImagesInText(question) && images.conditionImages.length > 0) {
        question = this.formatTextWithImages(question, images.conditionImages)
      }
      
      let solution = row.solution_text || ''
      
      if (!hasImagesInText(solution) && images.solutionImages.length > 0) {
        solution = this.formatTextWithImages(solution, images.solutionImages)
      }
      
      // Добавляем "Ответ:" в конец решения, если есть ответ и его еще нет в решении
      if (solution && row.answer && row.answer.trim()) {
        const answerText = row.answer.trim()
        // Проверяем, нет ли уже "Ответ:" в решении
        if (!solution.includes('Ответ:') && !solution.includes('Ответ ')) {
          solution = solution.trim()
          // Добавляем перенос строки перед "Ответ:", если его нет
          if (!solution.endsWith('\n')) {
            solution += '\n\n'
          }
          solution += `Ответ: ${answerText}`
        }
      }

      return {
        id: `${row.subject_code}-${row.problem_id}`,
        subject: subjectName,
        type: 'text',
        question,
        answer: answers.length > 0 ? answers : [],
        solution,
        topic: row.topic_name || null,
        topicNumber: row.topic_number || null,
        url: row.url || null,
        createdAt: row.created_at || null,
      }
    })
  }

  async findOne(id: string) {
    // Парсим ID вида "bio_oge-40797" или "bio-40797"
    const parts = id.split('-')
    const problemId = parts[parts.length - 1]
    const subjectCodeRaw = parts[0]
    // Нормализуем код для запроса к БД
    const normalizedCode = this.normalizeSubjectCode(subjectCodeRaw)

    const query = `
      SELECT 
        p.id,
        p.problem_id,
        p.subject_id,
        p.topic_id,
        p.condition_text,
        p.solution_text,
        p.answer,
        p.url,
        p.created_at,
        s.code as subject_code,
        s.name as subject_name,
        t.topic_number,
        t.topic_name
      FROM problems p
      LEFT JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN topics t ON p.topic_id = t.id
      WHERE p.problem_id = ? AND s.code = ?
    `
    
    const row = this.db.prepare(query).get(problemId, normalizedCode) as any

    if (!row) {
      return null
    }

    // Маппинг кодов БД на коды предметов
    const dbSubjectMap: Record<string, string> = {
      'math': 'math',
      'mathb': 'mathb',
      'russian': 'rus',
      'rus': 'rus',
      'phys': 'phys',
      'inf': 'inf',
      'bio': 'bio',
      'chem': 'chem',
      'geo': 'geo',
      'soc': 'soc',
      'hist': 'hist',
      'lit': 'lit',
      'en': 'en',
      'de': 'de',
      'fr': 'fr',
      'sp': 'sp',
    }

    const subjectName = dbSubjectMap[row.subject_code] || row.subject_code

    const answers = row.answer 
      ? row.answer.split('|').map((a: string) => a.trim()).filter(Boolean)
      : []

    // Загружаем изображения для задачи
    const images = this.getProblemImages(row.id)
    
    // Проверяем, есть ли уже изображения в тексте (из БД)
    const hasImagesInText = (text: string) => {
      return text && /!\[.*?\]\(.*?\)/.test(text)
    }
    
    // Формируем текст вопроса и решения с изображениями
    // Если изображения уже есть в тексте, не добавляем их повторно
    let question = row.condition_text || ''
    if (!hasImagesInText(question) && images.conditionImages.length > 0) {
      question = this.formatTextWithImages(question, images.conditionImages)
    }
    
    let solution = row.solution_text || ''
    if (!hasImagesInText(solution) && images.solutionImages.length > 0) {
      solution = this.formatTextWithImages(solution, images.solutionImages)
    }
    
    // Добавляем "Ответ:" в конец решения, если есть ответ и его еще нет в решении
    if (solution && row.answer && row.answer.trim()) {
      const answerText = row.answer.trim()
      // Проверяем, нет ли уже "Ответ:" в решении
      if (!solution.includes('Ответ:') && !solution.includes('Ответ ')) {
        solution = solution.trim()
        // Добавляем перенос строки перед "Ответ:", если его нет
        if (!solution.endsWith('\n')) {
          solution += '\n\n'
        }
        solution += `Ответ: ${answerText}`
      }
    }

    return {
      id: `${row.subject_code}-${row.problem_id}`,
      subject: subjectName,
      type: 'text',
      question,
      answer: answers.length > 0 ? answers : [],
      solution,
      topic: row.topic_name || null,
      topicNumber: row.topic_number || null,
      url: row.url || null,
      createdAt: row.created_at || null,
    }
  }

  async findBySubject(subject: string, examType: 'oge' | 'ege' = 'oge') {
    // Нормализуем код предмета для запроса к БД
    // В базе данных коды хранятся без суффикса _oge/_ege
    const normalizedCode = this.normalizeSubjectCode(subject)
    return this.findAll(normalizedCode)
  }

  async getTopics() {
    const rows = this.db
      .prepare(`
        SELECT DISTINCT t.id, t.topic_number, t.topic_name, t.topic_line
        FROM topics t
        INNER JOIN problems p ON t.id = p.topic_id
        WHERE t.topic_name IS NOT NULL 
        ORDER BY t.topic_name
      `)
      .all() as any[]

    return rows.map((row) => ({
      id: row.id,
      number: row.topic_number,
      name: row.topic_name,
      topicLine: row.topic_line || null,
    }))
  }

  async getTopicLines(subjectCode?: string) {
    // Используем поле line из таблицы problems, если оно заполнено,
    // иначе используем topic_line из topics
    let query = `
      SELECT DISTINCT COALESCE(p.line, t.topic_line) as line
      FROM problems p
      INNER JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN topics t ON p.topic_id = t.id
      WHERE (p.line IS NOT NULL AND p.line != '') 
         OR (t.topic_line IS NOT NULL AND t.topic_line != '')
    `
    const params: any[] = []

    if (subjectCode && subjectCode !== 'all') {
      const normalizedCode = this.normalizeSubjectCode(subjectCode)
      query += ' AND s.code = ?'
      params.push(normalizedCode)
    }

    query += ' ORDER BY line'

    const rows = this.db.prepare(query).all(...params) as any[]

    return rows.map((row) => ({
      line: row.line,
    }))
  }

  async getCategories() {
    const rows = this.db
      .prepare(`
        SELECT DISTINCT c.id, c.category_id, c.category_name 
        FROM categories c
        INNER JOIN category_problems cp ON c.id = cp.category_id
        WHERE c.category_name IS NOT NULL 
        ORDER BY c.category_name
      `)
      .all() as any[]

    return rows.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      name: row.category_name,
    }))
  }

  async getSubjects() {
    const rows = this.db
      .prepare(`
        SELECT DISTINCT s.id, s.code, s.name 
        FROM subjects s
        INNER JOIN problems p ON s.id = p.subject_id
        ORDER BY s.name
      `)
      .all() as any[]

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
    }))
  }

  onModuleDestroy() {
    this.db.close()
  }
}

