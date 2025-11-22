import Card from '../../../components/Card'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../../utils/userStore'
import { useTrainer } from '../hooks/useTrainer'
import TrainerTaskDisplay from './TrainerTaskDisplay'
import { getSubjectName } from '../../../constants/subjects'

/**
 * Модуль "Тренажер"
 * Предлагает случайные задания по предметам пользователя
 */
export default function TrainerModule() {
  const user = getCurrentUser()
  const {
    currentTask,
    userAnswer,
    setUserAnswer,
    isChecked,
    isCorrect,
    checkAnswer,
    getRandomTask,
    hasTasks,
    solvedToday
  } = useTrainer()

  const handleCheck = () => {
    if (!userAnswer.trim()) {
      return
    }
    checkAnswer()
  }

  const handleNext = () => {
    getRandomTask()
  }

  // Если пользователь не авторизован
  if (!user) {
    return (
      <Card className='h-full flex flex-col p-0 overflow-hidden'>
        <div className='px-3 pt-0 pb-3'>
          <div className='text-center mb-2'>
            <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
              Случайное задание
            </h2>
          </div>
          <div className='h-0.5 bg-cyan-200'></div>
        </div>
        <div className='px-3 pb-4 flex-1 flex flex-col'>
          <p className='text-gray-600 mb-4 flex-1'>
            Решайте случайные задания по выбранным предметам
          </p>
          <div className='flex gap-3 flex-wrap mt-auto'>
            <Link
              to='/login'
              className='px-4 md:px-5 py-2 md:py-3 rounded-xl border border-cyan-300 hover:bg-cyan-50 transition text-sm md:text-base whitespace-nowrap'
            >
              Войти / Регистрация
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Если у пользователя нет выбранных предметов
  if (!hasTasks) {
    return (
      <Card className='h-full flex flex-col p-0 overflow-hidden'>
        <div className='px-3 pt-0 pb-3'>
          <div className='text-center mb-2'>
            <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
              Случайное задание
            </h2>
          </div>
          <div className='h-0.5 bg-cyan-200'></div>
        </div>
        <div className='px-3 pb-4 flex-1 flex flex-col'>
          <p className='text-gray-600 mb-3 flex-1'>
            Для использования тренажера выберите предметы в настройках профиля
          </p>
          <div className='flex gap-3 flex-wrap mt-auto'>
            <Link
              to='/account'
              className='px-4 md:px-5 py-2 md:py-3 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition text-sm md:text-base whitespace-nowrap'
            >
              Настройки профиля
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='flex flex-col p-0 overflow-hidden'>
      {/* Header Section */}
      <div className='px-3 pt-0 pb-2 flex-shrink-0'>
        <div className='text-center mb-2'>
          <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
            Случайное задание
          </h2>
        </div>
        <div className='h-0.5 bg-cyan-200'></div>
      </div>

      {/* Content Section */}
      <div className='px-3 pb-3 flex flex-col'>
        {/* Название предмета и статистика в одной строке */}
        {currentTask && (
          <div className='mb-2 flex items-center justify-between flex-shrink-0'>
            <p className='text-sm text-cyan-700 font-medium'>
              {getSubjectName(currentTask.subject) || currentTask.subject}
            </p>
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
              Решено за сегодня: {solvedToday}
            </span>
          </div>
        )}

        {/* Задача */}
        <div className='mb-2'>
          <TrainerTaskDisplay
            task={currentTask}
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            isCorrect={isCorrect}
          />
        </div>

        {/* Кнопки */}
        <div className='flex flex-col gap-2 pt-2 border-t border-cyan-200 flex-shrink-0'>
          <button
            onClick={handleNext}
            className='w-full px-3 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-xs md:text-sm font-medium'
          >
            Следующее задание
          </button>
          
          <button
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
            className='w-full px-3 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs md:text-sm font-medium'
          >
            Подтвердить
          </button>
          
          {isChecked && isCorrect && (
            <p className='text-xs text-center text-green-600 mt-1'>
              Отлично! Вы можете перейти к следующему заданию
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
