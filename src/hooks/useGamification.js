import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '../utils/userStore'
import {
  getGamificationData,
  getCoins,
  addCoins,
  spendCoins,
  checkAndUpdateStreak,
  getPurchases,
  hasPurchased,
  purchaseFeature,
  getCoinHistory,
  getWeeklyLeaderboard
} from '../utils/gamificationStore'

/**
 * Хук для работы с системой геймификации
 * Управляет монетами, покупками, streak и рейтингом
 */
export function useGamification() {
  const user = getCurrentUser()
  const username = user?.username
  
  const [coins, setCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [purchases, setPurchases] = useState([])
  const [history, setHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  
  // Загружаем данные при монтировании
  useEffect(() => {
    if (!username) return
    
    loadData()
  }, [username])
  
  // Проверяем streak при загрузке
  useEffect(() => {
    if (!username) return
    
    const streakData = checkAndUpdateStreak(username)
    if (streakData.bonus > 0) {
      // Показываем уведомление о бонусе
      console.log(`🔥 Бонус за ${streakData.streak} дней подряд: +${streakData.bonus} монет!`)
    }
    loadData()
  }, [username])
  
  const loadData = useCallback(() => {
    if (!username) return
    
    const data = getGamificationData(username)
    setCoins(data.coins)
    setStreak(data.currentStreak)
    setLongestStreak(data.longestStreak)
    
    setPurchases(getPurchases(username))
    setHistory(getCoinHistory(username, 20))
    setLeaderboard(getWeeklyLeaderboard())
  }, [username])
  
  // Добавить монеты
  const addCoinsHandler = useCallback((amount, reason = '') => {
    if (!username) return false
    
    const newBalance = addCoins(username, amount, reason)
    setCoins(newBalance)
    loadData()
    return true
  }, [username, loadData])
  
  // Купить функцию
  const purchase = useCallback((feature, price) => {
    if (!username) return { success: false, error: 'Не авторизован' }
    
    const result = purchaseFeature(username, feature, price)
    
    if (result.success) {
      loadData()
    }
    
    return result
  }, [username, loadData])
  
  // Проверить, куплена ли функция
  const isPurchased = useCallback((feature) => {
    if (!username) return false
    return hasPurchased(username, feature)
  }, [username])
  
  // Обновить данные (для вызова извне)
  const refresh = useCallback(() => {
    loadData()
  }, [loadData])
  
  return {
    coins,
    streak,
    longestStreak,
    purchases,
    history,
    leaderboard,
    addCoins: addCoinsHandler,
    purchase,
    isPurchased,
    refresh,
    hasUser: !!username
  }
}

