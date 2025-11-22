/**
 * Gamification Store - управление монетами, покупками, streak в localStorage
 */

import { COIN_REWARDS } from '../constants/prices'
import { getUserFull } from './userStore'

const LS_GAMIFICATION = 'edumvp_gamification'
const LS_PURCHASES = 'edumvp_purchases'
const LS_COIN_HISTORY = 'edumvp_coin_history'

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

/**
 * Получить данные геймификации пользователя
 */
export function getGamificationData(username) {
  if (!username) return null
  
  const data = load(LS_GAMIFICATION, {})
  return data[username] || {
    coins: 0,
    lastActivityDate: null,
    currentStreak: 0,
    longestStreak: 0
  }
}

/**
 * Обновить данные геймификации
 */
export function updateGamificationData(username, updates) {
  if (!username) return
  
  const data = load(LS_GAMIFICATION, {})
  data[username] = {
    ...getGamificationData(username),
    ...updates
  }
  save(LS_GAMIFICATION, data)
  return data[username]
}

/**
 * Получить баланс монет пользователя
 */
export function getCoins(username) {
  return getGamificationData(username).coins
}

/**
 * Добавить монеты
 */
export function addCoins(username, amount, reason = '') {
  if (!username || amount <= 0) return
  
  const current = getGamificationData(username)
  const newCoins = current.coins + amount
  
  updateGamificationData(username, { coins: newCoins })
  
  // Добавляем в историю
  addCoinTransaction(username, amount, reason)
  
  return newCoins
}

/**
 * Списать монеты (для покупок)
 */
export function spendCoins(username, amount, reason = '') {
  if (!username || amount <= 0) return false
  
  const current = getGamificationData(username)
  if (current.coins < amount) return false
  
  const newCoins = current.coins - amount
  updateGamificationData(username, { coins: newCoins })
  
  // Добавляем в историю как отрицательную транзакцию
  addCoinTransaction(username, -amount, reason)
  
  return true
}

/**
 * Проверить и обновить streak
 * Возвращает { streak: number, bonus: number } - бонус 10 монет за 5 дней подряд
 */
export function checkAndUpdateStreak(username) {
  if (!username) return { streak: 0, bonus: 0 }
  
  const data = getGamificationData(username)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  
  let newStreak = data.currentStreak
  let bonus = 0
  
  // Если сегодня уже был вход, не меняем streak
  if (data.lastActivityDate === today) {
    return { streak: newStreak, bonus: 0 }
  }
  
  // Если вчера был вход, увеличиваем streak
  if (data.lastActivityDate === yesterday) {
    newStreak += 1
  } 
  // Если последний вход был давно, сбрасываем streak
  else if (data.lastActivityDate && data.lastActivityDate !== today) {
    newStreak = 1
  }
  // Если первый вход
  else {
    newStreak = 1
  }
  
  // Бонус за 5 дней подряд
  if (newStreak > 0 && newStreak % 5 === 0) {
    bonus = COIN_REWARDS.STREAK_5
    addCoins(username, bonus, 'streak_5_days')
  }
  
  // Обновляем рекорд
  const longestStreak = Math.max(newStreak, data.longestStreak)
  
  updateGamificationData(username, {
    lastActivityDate: today,
    currentStreak: newStreak,
    longestStreak
  })
  
  return { streak: newStreak, bonus }
}

/**
 * Получить список покупок пользователя
 */
export function getPurchases(username) {
  if (!username) return []
  
  const purchases = load(LS_PURCHASES, {})
  return purchases[username] || []
}

/**
 * Проверить, куплена ли функция
 */
export function hasPurchased(username, feature) {
  const purchases = getPurchases(username)
  return purchases.some(p => p.feature === feature)
}

/**
 * Купить функцию
 */
export function purchaseFeature(username, feature, price) {
  if (!username) return false
  
  // Проверяем, не куплена ли уже
  if (hasPurchased(username, feature)) {
    return { success: false, error: 'Уже куплено' }
  }
  
  // Проверяем баланс
  const coins = getCoins(username)
  if (coins < price) {
    return { success: false, error: 'Недостаточно монет' }
  }
  
  // Списываем монеты
  const spent = spendCoins(username, price, `purchase_${feature}`)
  if (!spent) {
    return { success: false, error: 'Ошибка списания монет' }
  }
  
  // Добавляем покупку
  const purchases = load(LS_PURCHASES, {})
  if (!purchases[username]) {
    purchases[username] = []
  }
  
  purchases[username].push({
    feature,
    price,
    timestamp: new Date().toISOString()
  })
  
  save(LS_PURCHASES, purchases)
  
  return { success: true, remaining: getCoins(username) }
}

/**
 * Добавить транзакцию монет в историю
 */
function addCoinTransaction(username, amount, reason) {
  const history = load(LS_COIN_HISTORY, {})
  if (!history[username]) {
    history[username] = []
  }
  
  history[username].unshift({
    amount,
    reason,
    timestamp: new Date().toISOString(),
    balance: getCoins(username)
  })
  
  // Храним только последние 100 транзакций
  if (history[username].length > 100) {
    history[username] = history[username].slice(0, 100)
  }
  
  save(LS_COIN_HISTORY, history)
}

/**
 * Получить историю транзакций
 */
export function getCoinHistory(username, limit = 20) {
  if (!username) return []
  
  const history = load(LS_COIN_HISTORY, {})
  const userHistory = history[username] || []
  
  return limit ? userHistory.slice(0, limit) : userHistory
}

/**
 * Получить рейтинг пользователей по монетам за последний месяц
 */
export function getWeeklyLeaderboard() {
  const history = load(LS_COIN_HISTORY, {})
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  
  const userCoins = {}
  
  // Подсчитываем монеты за месяц для каждого пользователя
  Object.keys(history).forEach(username => {
    const monthlyTransactions = history[username].filter(t => {
      const transactionDate = new Date(t.timestamp).getTime()
      return transactionDate >= monthAgo && t.amount > 0 // Только начисления
    })
    
    const totalCoins = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    if (totalCoins > 0) {
      userCoins[username] = totalCoins
    }
  })
  
  // Сортируем по убыванию и добавляем имя, фамилию и аватар
  const leaderboard = Object.keys(userCoins)
    .map(username => {
      const user = getUserFull(username)
      const firstName = user?.firstName || ''
      const lastName = user?.lastName || ''
      const displayName = `${lastName} ${firstName}`.trim() || username
      const avatar = user?.avatar || ''
      
      return {
        username,
        firstName,
        lastName,
        displayName,
        avatar,
        coins: userCoins[username]
      }
    })
    .sort((a, b) => b.coins - a.coins)
  
  return leaderboard
}

/**
 * Инициализация store при загрузке приложения
 */
export function initGamificationStore() {
  if (!load(LS_GAMIFICATION, null)) {
    save(LS_GAMIFICATION, {})
  }
  if (!load(LS_PURCHASES, null)) {
    save(LS_PURCHASES, {})
  }
  if (!load(LS_COIN_HISTORY, null)) {
    save(LS_COIN_HISTORY, {})
  }
}

/**
 * Сбросить все покупки пользователя (для тестирования)
 */
export function resetPurchases(username) {
  if (!username) return false
  
  const purchases = load(LS_PURCHASES, {})
  purchases[username] = []
  save(LS_PURCHASES, purchases)
  
  return true
}

/**
 * Сбросить монеты пользователя к 0 (для тестирования)
 */
export function resetCoins(username) {
  if (!username) return false
  
  const data = load(LS_GAMIFICATION, {})
  if (data[username]) {
    const currentCoins = data[username].coins || 0
    data[username].coins = 0
    save(LS_GAMIFICATION, data)
    
    // Добавляем транзакцию в историю (отрицательную, если были монеты)
    if (currentCoins > 0) {
      addCoinTransaction(username, -currentCoins, 'test_reset_coins')
    }
  }
  
  return true
}

