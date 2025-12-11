import apiClient from './api.js'

/**
 * Courses Service
 */

export const coursesService = {
  /**
   * Получить все курсы
   * @returns {Promise<any[]>}
   */
  async getAll() {
    const response = await apiClient.get('/courses')
    return response.data
  },

  /**
   * Получить курс по ID
   * @param {string} id
   * @returns {Promise<any>}
   */
  async getById(id) {
    const response = await apiClient.get(`/courses/${id}`)
    return response.data
  },

  /**
   * Получить курс по предмету
   * @param {string} subject
   * @returns {Promise<any>}
   */
  async getBySubject(subject) {
    const response = await apiClient.get(`/courses/subject/${subject}`)
    return response.data
  },
}

