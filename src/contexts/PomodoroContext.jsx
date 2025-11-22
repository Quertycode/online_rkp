import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const PomodoroContext = createContext()

/**
 * Длительность сессий в секундах
 */
const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

/**
 * Provider для управления Pomodoro таймером
 * Синхронизирует состояние между всеми компонентами
 */
export function PomodoroProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Загружаем из localStorage или используем значение по умолчанию
    const saved = localStorage.getItem('pomodoro_timeLeft')
    return saved ? parseInt(saved, 10) : WORK_TIME
  })
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('pomodoro_isRunning')
    return saved === 'true'
  })
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('pomodoro_mode')
    return saved || 'work'
  })
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const saved = localStorage.getItem('pomodoro_sessionsCompleted')
    return saved ? parseInt(saved, 10) : 0
  })
  
  const intervalRef = useRef(null)
  const notificationShownRef = useRef(false)
  
  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('pomodoro_timeLeft', timeLeft.toString())
  }, [timeLeft])
  
  useEffect(() => {
    localStorage.setItem('pomodoro_isRunning', isRunning.toString())
    // Если таймер был запущен до обновления страницы, продолжаем его работу
    if (isRunning && timeLeft > 0) {
      // Таймер уже запущен через основной useEffect
    }
  }, [isRunning, timeLeft])
  
  useEffect(() => {
    localStorage.setItem('pomodoro_mode', mode)
  }, [mode])
  
  useEffect(() => {
    localStorage.setItem('pomodoro_sessionsCompleted', sessionsCompleted.toString())
  }, [sessionsCompleted])
  
  // Восстанавливаем состояние таймера при монтировании, если он был запущен
  useEffect(() => {
    const savedIsRunning = localStorage.getItem('pomodoro_isRunning') === 'true'
    const savedTimeLeft = localStorage.getItem('pomodoro_timeLeft')
    
    // Если таймер был запущен и время не истекло, продолжаем работу
    if (savedIsRunning && savedTimeLeft && parseInt(savedTimeLeft, 10) > 0) {
      // Состояние уже восстановлено из useState, просто убеждаемся что таймер работает
      // Основной useEffect автоматически запустит интервал, если isRunning === true
    }
  }, [])
  
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
  }, [mode])
  
  // Переключить режим work/break
  const switchMode = useCallback(() => {
    const newMode = mode === 'work' ? 'break' : 'work'
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME)
    setIsRunning(false)
    notificationShownRef.current = false
  }, [mode])
  
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
        setTimeLeft(prev => {
          const newTime = prev - 1
          // Сохраняем время в localStorage при каждом обновлении
          localStorage.setItem('pomodoro_timeLeft', newTime.toString())
          return newTime
        })
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
  }, [timeLeft, mode, showNotification])
  
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
  }, [mode, timeLeft])
  
  const value = {
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
  
  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

/**
 * Хук для использования контекста Pomodoro
 */
export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (!context) {
    // Если контекст не доступен, возвращаем значения по умолчанию
    // Это позволяет использовать хук даже без Provider (для обратной совместимости)
    return {
      timeLeft: WORK_TIME,
      timeLeftFormatted: '25:00',
      isRunning: false,
      mode: 'work',
      sessionsCompleted: 0,
      progress: 0,
      start: () => {},
      pause: () => {},
      reset: () => {},
      switchMode: () => {},
      requestNotificationPermission: async () => {}
    }
  }
  return context
}

