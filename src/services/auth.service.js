import apiClient from './api.js'

/**
 * Auth Service
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} RegisterData
 * @property {string} email
 * @property {string} username
 * @property {string} password
 * @property {string} [firstName]
 * @property {string} [lastName]
 */

export const authService = {
  /**
   * Регистрация нового пользователя
   * @param {RegisterData} data
   * @returns {Promise<any>}
   */
  async register(data) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  /**
   * Вход пользователя
   * @param {LoginCredentials} credentials
   * @returns {Promise<{access_token: string, user: any}>}
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    const { access_token, user } = response.data
    localStorage.setItem('auth_token', access_token)
    return { access_token, user }
  },

  /**
   * Получить профиль текущего пользователя
   * @returns {Promise<any>}
   */
  async getProfile() {
    const response = await apiClient.post('/auth/profile')
    return response.data
  },

  /**
   * Выход из системы
   */
  logout() {
    localStorage.removeItem('auth_token')
  },

  /**
   * Проверить, авторизован ли пользователь
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },
}

