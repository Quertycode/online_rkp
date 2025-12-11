import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import { addCoins } from '../../../utils/gamificationStore'
import { COIN_REWARDS } from '../../../constants/prices'
import tasks from '../../../data/tasks.json'
import { getSubjectName } from '../../../constants/subjects'

const LS_TRAINER_SOLVED_TODAY = 'trainer_solved_today'

/**
 * Получить количество решенных заданий за сегодня
 */
function getSolvedTodayCount() {
  try {
    const data = localStorage.getItem(LS_TRAINER_SOLVED_TODAY)
    if (!data) return 0
    
    const parsed = JSON.parse(data)
    const today = new Date().toDateString()
    
    // Если данные за сегодня, возвращаем количество
    if (parsed.date === today) {
      return parsed.count || 0
    }
    
    // Если данные за другой день, очищаем и возвращаем 0
    return 0
  } catch {
    return 0
  }
}

/**
 * Увеличить счетчик решенных заданий за сегодня
 */
function incrementSolvedToday() {
  try {
    const today = new Date().toDateString()
    const data = localStorage.getItem(LS_TRAINER_SOLVED_TODAY)
    
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.date === today) {
        parsed.count = (parsed.count || 0) + 1
        localStorage.setItem(LS_TRAINER_SOLVED_TODAY, JSON.stringify(parsed))
        return parsed.count
      }
    }
    
    // Создаем новую запись за сегодня
    const newData = { date: today, count: 1 }
    localStorage.setItem(LS_TRAINER_SOLVED_TODAY, JSON.stringify(newData))
    return 1
  } catch {
    return 0
  }
}

/**
 * Хук для работы с тренажером
 * Получает случайные задания по предметам пользователя
 */
export function useTrainer() {
  const user = getCurrentUser()
  const [currentTask, setCurrentTask] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [solvedToday, setSolvedToday] = useState(0)
  const taskIdRef = useRef(null) // Храним ID текущей задачи, чтобы не менять её при вводе

  // Получаем предметы по открытому доступу
  const userSubjects = useMemo(() => {
    if (!user?.access) return []
    return Object.entries(user.access)
      .filter(([, value]) => value?.enabled)
      .map(([subject]) => subject)
  }, [user?.access])

  // Фильтруем задачи по предметам пользователя
  const availableTasks = useMemo(() => {
    if (userSubjects.length === 0) {
      return []
    }
    return tasks.filter(task => userSubjects.includes(task.subject))
  }, [userSubjects])

  // Загружаем количество решенных за сегодня
  useEffect(() => {
    setSolvedToday(getSolvedTodayCount())
  }, [])

  // Получаем случайную задачу
  const getRandomTask = useCallback(() => {
    if (availableTasks.length === 0) {
      setCurrentTask(null)
      taskIdRef.current = null
      return
    }
    const randomIndex = Math.floor(Math.random() * availableTasks.length)
    const newTask = availableTasks[randomIndex]
    setCurrentTask(newTask)
    taskIdRef.current = newTask.id
    setUserAnswer('')
    setIsChecked(false)
  }, [availableTasks])

  // Загружаем первую задачу при монтировании или изменении доступных задач
  // Используем useRef чтобы отслеживать, загружали ли мы задачу для текущего списка задач
  const tasksLengthRef = useRef(-1) // Инициализируем как -1, чтобы гарантировать первую загрузку
  useEffect(() => {
    // Загружаем задачу только если:
    // 1. Есть доступные задачи
    // 2. И (задача еще не загружена ИЛИ изменилось количество доступных задач)
    if (availableTasks.length > 0) {
      if (!taskIdRef.current || tasksLengthRef.current !== availableTasks.length) {
        getRandomTask()
        tasksLengthRef.current = availableTasks.length
      }
    } else {
      setCurrentTask(null)
      taskIdRef.current = null
      tasksLengthRef.current = 0
    }
    // НЕ добавляем getRandomTask в зависимости, чтобы избежать лишних перезагрузок
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTasks.length])

  // Проверяем ответ
  const checkAnswer = () => {
    if (!currentTask || !userAnswer.trim()) {
      return false
    }
    setIsChecked(true)
    const correct = currentTask.answer.some(
      correctAnswer => 
        correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    )
    
    // Если ответ правильный, увеличиваем счетчик решенных за сегодня
    if (correct) {
      const newCount = incrementSolvedToday()
      setSolvedToday(newCount)
      
      // Начисляем монеты за каждые 10 заданий
      if (user?.username) {
        const today = new Date().toDateString()
        const coinsKey = `trainer_coins_${user.username}_${today}`
        const coinsData = JSON.parse(localStorage.getItem(coinsKey) || '{"count": 0}')
        
        // Проверяем, кратно ли 10
        if (newCount % 10 === 0 && newCount > 0) {
          // Проверяем, не начисляли ли уже за это 10-е задание
          const lastRewarded = coinsData.lastRewarded || 0
          if (newCount > lastRewarded) {
            addCoins(user.username, COIN_REWARDS.TRAINER_10_TASKS, 'trainer_10_tasks_completed')
            coinsData.lastRewarded = newCount
            localStorage.setItem(coinsKey, JSON.stringify(coinsData))
            console.log(`🎉 Решено ${newCount} заданий! +${COIN_REWARDS.TRAINER_10_TASKS} монет`)
          }
        }
      }
    }
    
    return correct
  }

  // Получаем результат проверки
  const isCorrect = useMemo(() => {
    if (!isChecked || !currentTask || !userAnswer.trim()) {
      return null
    }
    return currentTask.answer.some(
      correctAnswer => 
        correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    )
  }, [isChecked, currentTask, userAnswer])

  // Получаем название предмета
  const getSubjectNameLocal = (subjectKey) => {
    return getSubjectName(subjectKey) || subjectKey
  }

  return {
    currentTask,
    userAnswer,
    setUserAnswer,
    isChecked,
    isCorrect,
    checkAnswer,
    getRandomTask,
    availableTasks: availableTasks.length,
    userSubjects,
    getSubjectName: getSubjectNameLocal,
    hasTasks: availableTasks.length > 0,
    solvedToday
  }
}
