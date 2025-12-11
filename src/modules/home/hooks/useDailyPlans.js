import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, getUserFull } from '../../../utils/userStore'
import { addCoins } from '../../../utils/gamificationStore'
import { COIN_REWARDS } from '../../../constants/prices'
import { getAllSubjects } from '../../../constants/subjects'
import { getCourse, getLessons } from '../../../utils/courseStore'

/**
 * Хук для управления планами на день
 * Возвращает следующую тему для изучения, ежедневные домашние задания и задания тренажера
 */
export function useDailyPlans() {
  const user = getCurrentUser()
  const fullUser = user ? getUserFull(user.username) : null
  const [plans, setPlans] = useState({
    topic: null,
    homework: [],
    trainer: { total: 3, completed: 0 }
  })
  const [progress, setProgress] = useState({
    topic: { watched: false, completed: false },
    homework: [],
    trainer: { completed: 0 }
  })
  
  // Ref для отслеживания последней проверки награды
  const lastRewardCheckRef = useRef('')
  // Ref для отслеживания инициализации
  const initializedRef = useRef(false)
  const lastUsernameRef = useRef('')

  useEffect(() => {
    if (!user?.username) return
    
    const username = user.username
    
    // Если пользователь изменился, сбрасываем флаг инициализации
    if (lastUsernameRef.current !== username) {
      initializedRef.current = false
      lastUsernameRef.current = username
    }
    
    // Если уже инициализировали для этого пользователя, пропускаем
    if (initializedRef.current) return
    
    // Получаем fullUser внутри эффекта, чтобы избежать проблем с зависимостями
    const currentFullUser = fullUser || getUserFull(username)
    if (!currentFullUser) return

    // Загружаем сохраненный прогресс
    const savedProgress = localStorage.getItem(`daily_progress_${username}`)
    const savedPlans = localStorage.getItem(`daily_plans_${username}`)
    const lastDate = localStorage.getItem(`daily_plans_date_${username}`)
    const today = new Date().toDateString()

    // Если планы не созданы или дата изменилась, создаем новые планы
    if (!savedPlans || lastDate !== today) {
      initializeDailyPlans(user, currentFullUser)
      initializedRef.current = true
    } else {
      try {
        const parsedPlans = JSON.parse(savedPlans)
        setPlans(parsedPlans)

        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress)
          setProgress(parsedProgress)
    }
      } catch (error) {
        console.error('Ошибка парсинга планов:', error)
        // Если ошибка, инициализируем заново
        initializeDailyPlans(user, currentFullUser)
      }
      
      initializedRef.current = true
    }
  }, [user?.username])

  // Синхронизация прогресса темы с прогрессом урока
  useEffect(() => {
    if (!user || !plans.topic) return

    const syncProgress = () => {
      const userProgress = JSON.parse(
        localStorage.getItem(`progress_${user.username}`) || '{}'
      )
      const key = `${plans.topic.subject}_${plans.topic.lessonId}`
      const lessonProgress = userProgress[key] || { watched: false, completed: false }

      // Обновляем прогресс темы, если он изменился
      setProgress(prevProgress => {
        // Проверяем, действительно ли изменились значения
        const watchedChanged = prevProgress.topic.watched !== lessonProgress.watched
        const completedChanged = prevProgress.topic.completed !== lessonProgress.completed
        
        if (watchedChanged || completedChanged) {
          const newProgress = {
            ...prevProgress,
            topic: {
              watched: lessonProgress.watched,
              completed: lessonProgress.completed
            }
          }
          localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
          return newProgress
        }
        // Возвращаем тот же объект, если ничего не изменилось
        return prevProgress
      })
    }

    // Синхронизируем сразу
    syncProgress()

    // Синхронизируем при изменении localStorage (событие storage срабатывает в других вкладках)
    const handleStorageChange = (e) => {
      if (e.key === `progress_${user.username}`) {
        syncProgress()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Периодическая синхронизация (каждые 5 секунд вместо 2, чтобы уменьшить нагрузку)
    const interval = setInterval(syncProgress, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user?.username, plans.topic?.subject, plans.topic?.lessonId])

  /**
   * Инициализация планов на день
   */
  const initializeDailyPlans = (user, fullUser) => {
    // 1. Найти следующую тему для изучения
    const allSubjects = getAllSubjects().map(s => s.code)
    const availableSubjects = allSubjects.filter(
      subject => fullUser?.access?.[subject]?.enabled
    )

    if (availableSubjects.length === 0) {
      return
    }

    // Выбираем первый доступный предмет (можно улучшить логику выбора)
    const subject = availableSubjects[0]
    const course = getCourse(subject)

    if (!course) return

    // Находим следующую не пройденную тему
    const userProgress = JSON.parse(
      localStorage.getItem(`progress_${user.username}`) || '{}'
    )

    let nextTopic = null
    const lessons = getLessons(subject)
    for (const lesson of lessons) {
      const key = `${subject}_${lesson.id}`
      const lessonProgress = userProgress[key] || { watched: false, completed: false }
      
      if (!lessonProgress.completed) {
        nextTopic = {
          subject,
          lessonId: lesson.id,
          title: lesson.title,
          progress: lessonProgress
        }
        break
      }
    }

    // 2. Создаем ежедневные домашние задания (2 для теста)
    // Пока используем простую логику - берем первые 2 задания из всех доступных
    const dailyHomework = [
      { id: 1, taskId: 1, completed: false },
      { id: 2, taskId: 2, completed: false }
    ]

    // 3. Задания тренажера (3 для теста)
    const trainer = {
      total: 3,
      completed: 0
    }

    const newPlans = {
      topic: nextTopic,
      homework: dailyHomework,
      trainer
    }

    setPlans(newPlans)
    localStorage.setItem(`daily_plans_${user.username}`, JSON.stringify(newPlans))
    localStorage.setItem(`daily_plans_date_${user.username}`, new Date().toDateString())

    // Инициализируем прогресс
    const newProgress = {
      topic: nextTopic ? nextTopic.progress : { watched: false, completed: false },
      homework: dailyHomework.map(hw => ({ id: hw.id, completed: false })),
      trainer: { completed: 0 }
    }
    setProgress(newProgress)
    localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
  }

  /**
   * Отметить тему как просмотренную
   */
  const markTopicAsWatched = () => {
    if (!plans.topic) return

    const key = `${plans.topic.subject}_${plans.topic.lessonId}`
    const userProgress = JSON.parse(
      localStorage.getItem(`progress_${user.username}`) || '{}'
    )

    userProgress[key] = {
      ...userProgress[key],
      watched: true
    }

    localStorage.setItem(`progress_${user.username}`, JSON.stringify(userProgress))

    const newProgress = {
      ...progress,
      topic: { ...progress.topic, watched: true }
    }
    setProgress(newProgress)
    localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
  }

  /**
   * Отметить тему как выполненную
   */
  const markTopicAsCompleted = () => {
    if (!plans.topic) return

    const key = `${plans.topic.subject}_${plans.topic.lessonId}`
    const userProgress = JSON.parse(
      localStorage.getItem(`progress_${user.username}`) || '{}'
    )

    userProgress[key] = {
      ...userProgress[key],
      watched: true,
      completed: true
    }

    localStorage.setItem(`progress_${user.username}`, JSON.stringify(userProgress))

    const newProgress = {
      ...progress,
      topic: { watched: true, completed: true }
    }
    setProgress(newProgress)
    localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
  }

  /**
   * Отметить домашнее задание как выполненное
   */
  const markHomeworkAsCompleted = (homeworkId) => {
    const newProgress = {
      ...progress,
      homework: progress.homework.map(hw =>
        hw.id === homeworkId ? { ...hw, completed: true } : hw
      )
    }
    setProgress(newProgress)
    localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
  }

  /**
   * Отметить задание тренажера как выполненное
   */
  const markTrainerTaskAsCompleted = () => {
    const newProgress = {
      ...progress,
      trainer: {
        completed: Math.min(progress.trainer.completed + 1, plans.trainer.total)
      }
    }
    setProgress(newProgress)
    localStorage.setItem(`daily_progress_${user.username}`, JSON.stringify(newProgress))
  }

  /**
   * Вычислить общий прогресс выполнения планов
   * Тема = 50%, остальные задания (домашка + тренажер) = 50%
   * Домашка: 25% от общего (часть от 50%)
   * Тренажер: 25% от общего (часть от 50%)
   */
  const calculateOverallProgress = () => {
    if (!user || !plans.topic) return 0

    // Прогресс темы (50% максимум)
    const topicProgress = progress.topic.completed ? 50 : (progress.topic.watched ? 25 : 0)

    // Прогресс домашних заданий (25% максимум, часть от 50%)
    const totalHomework = plans.homework.length || 1 // Избегаем деления на 0
    const completedHomework = progress.homework.filter(hw => hw.completed).length
    const homeworkProgress = totalHomework > 0 
      ? (completedHomework / totalHomework) * 25 // 25% от общего прогресса
      : 0

    // Прогресс тренажера (25% максимум, часть от 50%)
    const trainerTotal = plans.trainer.total || 1 // Избегаем деления на 0
    const trainerProgress = trainerTotal > 0
      ? (progress.trainer.completed / trainerTotal) * 25 // 25% от общего прогресса
      : 0

    const total = topicProgress + homeworkProgress + trainerProgress
    return Math.min(Math.round(total), 100) // Ограничиваем максимум 100%
  }

  // Начисляем монеты при достижении 100% прогресса
  useEffect(() => {
    if (!user || !plans.topic) return
    
    const today = new Date().toDateString()
    const currentProgress = calculateOverallProgress()
    
    // Проверяем только если дата изменилась или это первая проверка
    if (lastRewardCheckRef.current !== today && currentProgress === 100) {
      const rewardKey = `daily_reward_${user.username}_${today}`
      
      if (!localStorage.getItem(rewardKey)) {
        addCoins(user.username, COIN_REWARDS.DAILY_PLAN, 'daily_plan_completed')
        localStorage.setItem(rewardKey, 'true')
        lastRewardCheckRef.current = today
        console.log(`🎉 План на день выполнен! +${COIN_REWARDS.DAILY_PLAN} монет`)
      }
    }
  }, [user?.username, plans.topic?.subject, progress.topic.completed, progress.trainer.completed])

  return {
    plans,
    progress,
    markTopicAsWatched,
    markTopicAsCompleted,
    markHomeworkAsCompleted,
    markTrainerTaskAsCompleted,
    calculateOverallProgress
  }
}

