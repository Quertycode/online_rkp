import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Хук для Pomodoro таймера
 * 25 минут работы, 5 минут отдыха
 */
export function usePomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // В секундах
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work') // 'work' или 'break'
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  
  const intervalRef = useRef(null)
  const notificationShownRef = useRef(false)
  
  // Длительность сессий в секундах
  const WORK_TIME = 25 * 60
  const BREAK_TIME = 5 * 60
  
  // Запустить таймер
  const start = useCallback(() => {
    setIsRunning(true)
    notificationShownRef.current = false
  }, [])
  
  // Поставить на паузу
  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])
  
  // Сбросить таймер
  const reset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME)
    notificationShownRef.current = false
  }, [mode, WORK_TIME, BREAK_TIME])
  
  // Переключить режим work/break
  const switchMode = useCallback(() => {
    const newMode = mode === 'work' ? 'break' : 'work'
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME)
    setIsRunning(false)
    notificationShownRef.current = false
  }, [mode, WORK_TIME, BREAK_TIME])
  
  // Показать уведомление
  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  }, [])
  
  // Запросить разрешение на уведомления
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])
  
  // Основной таймер
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])
  
  // Обработка окончания сессии
  useEffect(() => {
    if (timeLeft === 0 && !notificationShownRef.current) {
      notificationShownRef.current = true
      setIsRunning(false)
      
      if (mode === 'work') {
        setSessionsCompleted(prev => prev + 1)
        showNotification(
          '🎉 Сессия завершена!',
          'Отличная работа! Пора отдохнуть 5 минут.'
        )
        // Автоматически переключаемся на перерыв
        setTimeout(() => {
          setMode('break')
          setTimeLeft(BREAK_TIME)
        }, 1000)
      } else {
        showNotification(
          '⏰ Перерыв окончен!',
          'Готов к следующей сессии? Пора работать!'
        )
        // Автоматически переключаемся на работу
        setTimeout(() => {
          setMode('work')
          setTimeLeft(WORK_TIME)
        }, 1000)
      }
    }
  }, [timeLeft, mode, showNotification, WORK_TIME, BREAK_TIME])
  
  // Форматировать время MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])
  
  // Вычислить прогресс в процентах
  const getProgress = useCallback(() => {
    const total = mode === 'work' ? WORK_TIME : BREAK_TIME
    return ((total - timeLeft) / total) * 100
  }, [mode, timeLeft, WORK_TIME, BREAK_TIME])
  
  return {
    timeLeft,
    timeLeftFormatted: formatTime(timeLeft),
    isRunning,
    mode,
    sessionsCompleted,
    progress: getProgress(),
    start,
    pause,
    reset,
    switchMode,
    requestNotificationPermission
  }
}

