import apiClient from './api.js'

/**
 * Tasks Service
 * Сервис для работы с заданиями из базы данных
 */

export const tasksService = {
  /**
   * Получить все задания
   * @param {string} subject - Предмет (опционально)
   * @returns {Promise<any[]>}
   */
  async getAll(subject, topicId, categoryId, topicLine) {
    try {
      const params = {}
      if (subject && subject !== 'all') params.subject = subject
      if (topicId) params.topicId = topicId
      if (categoryId) params.categoryId = categoryId
      if (topicLine && topicLine !== 'all') params.topicLine = topicLine
      
      const response = await apiClient.get('/tasks', { 
        params,
        timeout: 5000 // 5 секунд таймаут
      })
      return response.data || []
    } catch (error) {
      // Обрабатываем разные типы ошибок
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Таймаут при загрузке заданий: сервер не отвечает')
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('Не удалось подключиться к серверу')
      } else {
        console.error('Ошибка загрузки заданий:', error.response?.data || error.message)
      }
      // Если API недоступен, возвращаем пустой массив вместо ошибки
      return []
    }
  },

  /**
   * Получить задание по ID
   * @param {string} id
   * @returns {Promise<any>}
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Ошибка загрузки задания:', error)
      return null
    }
  },

  /**
   * Получить задания по предмету
   * @param {string} subject
   * @returns {Promise<any[]>}
   */
  async getBySubject(subject) {
    try {
      const response = await apiClient.get(`/tasks/subject/${subject}`)
      return response.data
    } catch (error) {
      console.error('Ошибка загрузки заданий по предмету:', error)
      return []
    }
  },

  /**
   * Получить список предметов
   * @returns {Promise<any[]>}
   */
  async getSubjects() {
    try {
      const response = await apiClient.get('/tasks/meta/subjects')
      return response.data || []
    } catch (error) {
      console.error('Ошибка загрузки предметов:', error)
      return []
    }
  },

  /**
   * Получить список тем
   * @returns {Promise<any[]>}
   */
  async getTopics() {
    try {
      const response = await apiClient.get('/tasks/meta/topics')
      return response.data || []
    } catch (error) {
      console.error('Ошибка загрузки тем:', error)
      return []
    }
  },

  /**
   * Получить список категорий
   * @returns {Promise<any[]>}
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/tasks/meta/categories')
      return response.data || []
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
      return []
    }
  },

  /**
   * Получить список линий
   * @param {string} subject - Код предмета для фильтрации (опционально)
   * @returns {Promise<any[]>}
   */
  async getTopicLines(subject) {
    try {
      const params = {}
      if (subject) params.subject = subject
      const response = await apiClient.get('/tasks/meta/lines', { params })
      return response.data || []
    } catch (error) {
      console.error('Ошибка загрузки линий:', error)
      return []
    }
  },
}

