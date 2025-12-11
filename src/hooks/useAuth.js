import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@services/auth.service'
import { getCurrentUser } from '@utils/userStore'

/**
 * Хук для работы с аутентификацией
 * @returns {Object}
 */
export function useAuth() {
  const [user, setUser] = useState(getCurrentUser())
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCurrentUser())
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getCurrentUser())
    setIsAuthenticated(!!getCurrentUser())
    setLoading(false)
  }, [])

  const login = useCallback(
    async (email, password) => {
      try {
        const { access_token, user } = await authService.login({ email, password })
        // Временно используем локальное хранилище
        localStorage.setItem('edumvp_current_user', JSON.stringify(user))
        setUser(user)
        setIsAuthenticated(true)
        return { success: true, user }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    []
  )

  const register = useCallback(
    async (userData) => {
      try {
        const newUser = await authService.register(userData)
        // Временно используем локальное хранилище
        localStorage.setItem('edumvp_current_user', JSON.stringify(newUser))
        setUser(newUser)
        setIsAuthenticated(true)
        return { success: true, user: newUser }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    []
  )

  const logout = useCallback(() => {
    authService.logout()
    localStorage.removeItem('edumvp_current_user')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate])

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  }
}

