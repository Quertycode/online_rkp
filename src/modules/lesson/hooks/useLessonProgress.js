import { useState, useEffect } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import { getTask } from '../../../utils/courseStore'

/**
 * Хук для работы с прогрессом урока
 * @param {string} subject - Предмет
 * @param {string} lessonId - ID урока
 */
export function useLessonProgress(subject, lessonId) {
  const user = getCurrentUser()
  const [progress, setProgress] = useState({})
  const [homeworkAnswers, setHomeworkAnswers] = useState({})

  useEffect(() => {
    if (!user?.username) return
    
    // Загружаем прогресс пользователя
    const savedProgress = localStorage.getItem(`progress_${user.username}`)
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress))
      } catch (error) {
        console.error('Error parsing progress:', error)
      }
    }

    // Загружаем ответы на домашние задания
    const savedAnswers = localStorage.getItem(`homework_${user.username}`)
    if (savedAnswers) {
      try {
        setHomeworkAnswers(JSON.parse(savedAnswers))
      } catch (error) {
        console.error('Error parsing homework answers:', error)
      }
    }
  }, [user?.username])

  const markAsWatched = () => {
    const key = `${subject}_${lessonId}`
    const newProgress = {
      ...progress,
      [key]: {
        ...progress[key],
        watched: true
      }
    }
    setProgress(newProgress)
    localStorage.setItem(`progress_${user.username}`, JSON.stringify(newProgress))
  }

  const handleHomeworkSubmit = (taskId, answer) => {
    if (!user) return
    
    const key = `${subject}_${lessonId}_${taskId}`
    const newAnswers = {
      ...homeworkAnswers,
      [key]: answer
    }
    setHomeworkAnswers(newAnswers)
    localStorage.setItem(`homework_${user.username}`, JSON.stringify(newAnswers))

    // Проверяем правильность/завершённость ответа
    const task = getTask(taskId)
    const taskType =
      task?.taskType ||
      (task?.subject === 'pract_psychology' && Number(task?.id) % 2 === 0 ? 'assignment' : 'test')

    let isCorrect = false
    if (taskType === 'assignment') {
      isCorrect = true
    } else {
      isCorrect =
        task &&
        (task.answer || []).some((correctAnswer) =>
          (correctAnswer || '').toLowerCase().trim() === String(answer || '').toLowerCase().trim()
        )
    }

    // Обновляем прогресс если ответ корректен/задание сдано
    if (isCorrect) {
      const progressKey = `${subject}_${lessonId}`
      const currentProgress = progress[progressKey] || { watched: false, completed: false }
      const newProgress = {
        ...progress,
        [progressKey]: {
          ...currentProgress,
          completed: true
        }
      }
      setProgress(newProgress)
      localStorage.setItem(`progress_${user.username}`, JSON.stringify(newProgress))
    }
  }

  const getTaskAnswer = (taskId) => {
    const key = `${subject}_${lessonId}_${taskId}`
    return homeworkAnswers[key] || ''
  }

  return {
    progress,
    homeworkAnswers,
    markAsWatched,
    handleHomeworkSubmit,
    getTaskAnswer
  }
}

