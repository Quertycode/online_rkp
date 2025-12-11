import { useState, useEffect, useCallback, useRef } from 'react'
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
  getWeeklyLeaderboard,
  addActiveSeconds
} from '../utils/gamificationStore'

/**
 * Хук для работы с системой геймификации
 * Управляет монетами, временем в обучении, покупками, streak и рейтингом
 */
export function useGamification() {
  const user = getCurrentUser()
  const username = user?.username
  
  const [coins, setCoins] = useState(0)
  const [timeSeconds, setTimeSeconds] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [purchases, setPurchases] = useState([])
  const [history, setHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const lastActivityRef = useRef(Date.now())
  const mediaPlayingCountRef = useRef(0)
  const pendingSecondsRef = useRef(0)
  
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
    setTimeSeconds(data.timeSeconds || 0)
    setStreak(data.currentStreak)
    setLongestStreak(data.longestStreak)
    
    setPurchases(getPurchases(username))
    setHistory(getCoinHistory(username, 20))
    setLeaderboard(getWeeklyLeaderboard())
  }, [username])

  // Отслеживание активности пользователя (мышь/клавиатура) и воспроизведения медиа
  useEffect(() => {
    if (!username) return

    const INACTIVITY_LIMIT = 60 * 1000 // 60 секунд
    const FLUSH_SECONDS = 10
    const activityOptions = { passive: true }
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    // Сброс при новой сессии пользователя
    lastActivityRef.current = Date.now()
    mediaPlayingCountRef.current = 0
    pendingSecondsRef.current = 0
    let intervalId = null

    const markActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const handleMediaPlay = (event) => {
      const target = event?.target
      if (!target || !(target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) return
      mediaPlayingCountRef.current += 1
    }

    const handleMediaPause = (event) => {
      const target = event?.target
      if (!target || !(target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) return
      mediaPlayingCountRef.current = Math.max(0, mediaPlayingCountRef.current - 1)
    }

    const flushPending = () => {
      if (pendingSecondsRef.current > 0) {
        const added = pendingSecondsRef.current
        pendingSecondsRef.current = 0
        const total = addActiveSeconds(username, added)
        setTimeSeconds(total)
      }
    }

    const isOnLearningPage = () => {
      if (typeof window === 'undefined') return false
      const path = window.location?.pathname || ''

      const isCourse = path === '/courses' || path.startsWith('/courses/')
      const isHomeworkDetails = path.startsWith('/homework/') && path !== '/homework'

      return isCourse || isHomeworkDetails
    }

    // Инкремент времени пока пользователь активен
    intervalId = setInterval(() => {
      const now = Date.now()
      if (!isOnLearningPage()) {
        return
      }
      const recentlyActive = now - lastActivityRef.current <= INACTIVITY_LIMIT
      const isMediaPlaying = mediaPlayingCountRef.current > 0
      const isActive = !document.hidden && (recentlyActive || isMediaPlaying)

      if (isActive) {
        pendingSecondsRef.current += 1
        setTimeSeconds((prev) => prev + 1)
        if (pendingSecondsRef.current >= FLUSH_SECONDS) {
          flushPending()
        }
      }
    }, 1000)

    activityEvents.forEach((event) => document.addEventListener(event, markActivity, activityOptions))
    document.addEventListener('visibilitychange', markActivity)
    document.addEventListener('play', handleMediaPlay, true)
    document.addEventListener('playing', handleMediaPlay, true)
    document.addEventListener('pause', handleMediaPause, true)
    document.addEventListener('ended', handleMediaPause, true)

    return () => {
      activityEvents.forEach((event) => document.removeEventListener(event, markActivity, activityOptions))
      document.removeEventListener('visibilitychange', markActivity)
      document.removeEventListener('play', handleMediaPlay, true)
      document.removeEventListener('playing', handleMediaPlay, true)
      document.removeEventListener('pause', handleMediaPause, true)
      document.removeEventListener('ended', handleMediaPause, true)
      if (intervalId) clearInterval(intervalId)
      flushPending()
    }
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
    timeSeconds,
    addCoins: addCoinsHandler,
    purchase,
    isPurchased,
    refresh,
    hasUser: !!username
  }
}

