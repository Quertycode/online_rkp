import { useState, useEffect } from 'react'

/**
 * Хук для выполнения API запросов
 * @param {Function} apiCall - Функция для вызова API
 * @param {Array} dependencies - Зависимости для useEffect
 * @returns {Object}
 */
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        if (!isCancelled) {
          setData(result)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, dependencies)

  return { data, loading, error }
}

