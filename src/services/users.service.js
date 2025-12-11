import apiClient from './api.js'

/**
 * Users Service
 */

export const usersService = {
  /**
   * Получить всех пользователей
   * @returns {Promise<any[]>}
   */
  async getAll() {
    const response = await apiClient.get('/users')
    return response.data
  },

  /**
   * Получить пользователя по ID
   * @param {string} id
   * @returns {Promise<any>}
   */
  async getById(id) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  /**
   * Обновить пользователя
   * @param {string} id
   * @param {any} data
   * @returns {Promise<any>}
   */
  async update(id, data) {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  /**
   * Удалить пользователя
   * @param {string} id
   * @returns {Promise<any>}
   */
  async delete(id) {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  },
}

