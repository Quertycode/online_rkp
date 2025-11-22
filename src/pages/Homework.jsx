import { useState, useEffect, useRef, useMemo } from 'react'
import { getCurrentUser } from '../utils/userStore'
import { useDailyPlans } from '../modules/home/hooks/useDailyPlans'
import tasksData from '../data/tasks.json'
import TaskCard from '../modules/lesson/components/TaskCard'

/**
 * Страница ежедневных домашних заданий
 */
export default function Homework() {
  const user = getCurrentUser()
  const { plans, progress, markHomeworkAsCompleted } = useDailyPlans()
  const [homeworkTasks, setHomeworkTasks] = useState([])
  const [answers, setAnswers] = useState({})
  
  // Создаем стабильную строку для сравнения домашних заданий
  const homeworkIdsString = useMemo(() => {
    if (!plans.homework || plans.homework.length === 0) return ''
    return JSON.stringify(
      plans.homework.map(hw => ({ id: hw.id, taskId: hw.taskId }))
    )
  }, [plans.homework])
  
  // Ref для отслеживания предыдущего значения, чтобы избежать лишних обновлений
  const prevHomeworkIdsRef = useRef('')
  const prevUserRef = useRef(null)

  useEffect(() => {
    if (!user) {
      setHomeworkTasks([])
      setAnswers({})
      prevUserRef.current = null
      return
    }

    if (!plans.homework || plans.homework.length === 0) {
      setHomeworkTasks([])
      prevHomeworkIdsRef.current = ''
      return
    }
    
    // Проверяем, изменились ли домашние задания или пользователь
    const userChanged = prevUserRef.current !== user.username
    const homeworkChanged = prevHomeworkIdsRef.current !== homeworkIdsString
    
    // Если ничего не изменилось, выходим раньше
    if (!userChanged && !homeworkChanged) {
      return
    }
    
    // Обновляем refs
    prevHomeworkIdsRef.current = homeworkIdsString
    prevUserRef.current = user.username

    // Получаем задания для ежедневной домашней работы
    const tasks = plans.homework.map(hw => {
      const task = tasksData.find(t => t.id === hw.taskId)
      return task ? { ...task, homeworkId: hw.id } : null
    }).filter(Boolean)

    setHomeworkTasks(tasks)

    // Загружаем сохраненные ответы только при изменении пользователя или домашних заданий
    if (userChanged || homeworkChanged) {
      const savedAnswers = localStorage.getItem(`daily_homework_${user.username}`)
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers))
        } catch (error) {
          console.error('Ошибка парсинга сохраненных ответов:', error)
          setAnswers({})
        }
      } else {
        setAnswers({})
      }
    }
  }, [user?.username, homeworkIdsString])

  const handleSubmit = (taskId, answer, homeworkId) => {
    if (!user) return

    // Сохраняем ответ
    const newAnswers = {
      ...answers,
      [homeworkId]: answer
    }
    setAnswers(newAnswers)
    localStorage.setItem(`daily_homework_${user.username}`, JSON.stringify(newAnswers))

    // Проверяем правильность ответа (как в TaskCard)
    const task = tasksData.find(t => t.id === taskId)
    if (!task || !answer) return

    const isCorrect = task.answer.some(correctAnswer => 
      correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
    )

    // Если ответ правильный, отмечаем задание как выполненное
    if (isCorrect && homeworkId && !progress.homework.find(hw => hw.id === homeworkId)?.completed) {
      markHomeworkAsCompleted(homeworkId)
    }
  }

  const getTaskAnswer = (homeworkId) => {
    return answers[homeworkId] || ''
  }

  if (!user) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Доступ запрещен</h2>
          <p>Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    )
  }

  const completedCount = progress.homework.filter(hw => hw.completed).length
  const totalCount = plans.homework.length

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Домашка</h1>
        <div className="text-sm text-gray-600">
          Выполнено: {completedCount} из {totalCount}
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          Ежедневные домашние задания назначаются автоматически. Решите все задания, чтобы завершить план на день.
        </p>
      </div>

      {homeworkTasks.length === 0 ? (
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90 text-center">
          <p className="text-gray-500">Нет домашних заданий на сегодня</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkTasks.map((task) => {
            const homeworkProgress = progress.homework.find(hw => hw.id === task.homeworkId)
            const isCompleted = homeworkProgress?.completed || false
            
            return (
              <div key={task.id} className="relative">
                {isCompleted && (
                  <div className="absolute top-2 right-2 text-green-600 text-xl z-10">
                    ✓
                  </div>
                )}
                <TaskCard
                  task={task}
                  answer={getTaskAnswer(task.homeworkId)}
                  onSubmit={(taskId, answer) => {
                    handleSubmit(taskId, answer, task.homeworkId)
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

