import { Link } from 'react-router-dom'
import Card from '../../../components/Card'
import { useDailyPlans } from '../hooks/useDailyPlans'
import { getCurrentUser } from '../../../utils/userStore'

/**
 * Модуль "Ваши курсы"
 * Отображает планы на день и статус их выполнения
 */
export default function CoursesModule() {
  const user = getCurrentUser()
  const {
    plans,
    progress,
    markTopicAsWatched,
    markTopicAsCompleted,
    markHomeworkAsCompleted,
    markTrainerTaskAsCompleted
  } = useDailyPlans()

  if (!user || !plans.topic) {
    return (
      <Card className='h-full flex flex-col p-0 overflow-hidden'>
        <div className='px-3 pt-0 pb-3'>
          <div className='text-center mb-2'>
            <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
              План на сегодня
            </h2>
          </div>
          <div className='h-0.5 bg-cyan-200'></div>
        </div>
        <div className='px-3 pb-3 flex-1 flex flex-col'>
          <p className='text-gray-600 text-sm md:text-base'>Загрузка планов...</p>
        </div>
      </Card>
    )
  }

  const topicCompleted = progress.topic.completed
  const topicWatched = progress.topic.watched
  const homeworkCompleted = progress.homework.filter(hw => hw.completed).length
  const trainerCompleted = progress.trainer.completed
  
  const homeworkProgress = (homeworkCompleted / plans.homework.length) * 100
  const trainerProgress = (trainerCompleted / plans.trainer.total) * 100

  return (
    <Card className='h-full flex flex-col p-0 overflow-hidden'>
      {/* Header Section */}
      <div className='px-3 pt-0 pb-3'>
        <div className='text-center mb-2'>
          <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
            План на сегодня
          </h2>
        </div>
        <div className='h-0.5 bg-cyan-200'></div>
      </div>
      
      {/* Content Section */}
      <div className='px-3 pb-3 flex-1 min-h-0 flex flex-col space-y-3'>
        {/* Изучить тему */}
        <div className={`group relative rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
          topicCompleted 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
            : topicWatched
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200'
            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-300'
        }`}>
          {/* Icon and Status Badge */}
          <div className='flex items-start gap-3 mb-3'>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              topicCompleted 
                ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                : topicWatched
                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                : 'bg-blue-500 shadow-lg shadow-blue-500/50'
            }`}>
              📚
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-1'>
                <h3 className='text-sm md:text-base font-bold text-gray-800'>
                  1. Изучи тему
                </h3>
                {topicCompleted ? (
                  <span className='flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                    ✓ Готово
                  </span>
                ) : topicWatched ? (
                  <span className='flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full'>
                    ◐ В процессе
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full'>
                    ○ Начать
                  </span>
                )}
              </div>
              <p className='text-xs md:text-sm text-gray-700 font-medium'>
                {plans.topic.title}
              </p>
            </div>
          </div>
          {!topicCompleted && (
            <Link
              to={`/courses/${plans.topic.subject}/${plans.topic.lessonId}`}
              className='inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-white px-3 py-2 rounded-lg hover:shadow-md'
            >
              Перейти к теме
              <span className='transform group-hover:translate-x-1 transition-transform'>→</span>
            </Link>
          )}
        </div>

        {/* Сдать домашку */}
        <div className={`group relative rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
          homeworkCompleted === plans.homework.length
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300'
        }`}>
          {/* Icon and Status Badge */}
          <div className='flex items-start gap-3 mb-3'>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              homeworkCompleted === plans.homework.length
                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                : 'bg-purple-500 shadow-lg shadow-purple-500/50'
            }`}>
              📝
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-1'>
                <h3 className='text-sm md:text-base font-bold text-gray-800'>
                  2. Сдать домашку
                </h3>
                {homeworkCompleted === plans.homework.length ? (
                  <span className='flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                    ✓ Готово
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                    {homeworkCompleted}/{plans.homework.length}
                  </span>
                )}
              </div>
              {/* Progress Bar */}
              <div className='w-full bg-white rounded-full h-2 mb-2 overflow-hidden shadow-inner'>
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    homeworkCompleted === plans.homework.length
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-purple-400 to-pink-500'
                  }`}
                  style={{ width: `${homeworkProgress}%` }}
                />
              </div>
              <p className='text-xs text-gray-600'>
                {homeworkCompleted} из {plans.homework.length} заданий выполнено
              </p>
            </div>
          </div>
          {homeworkCompleted < plans.homework.length && (
            <Link
              to='/homework'
              className='inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors bg-white px-3 py-2 rounded-lg hover:shadow-md'
            >
              Перейти к домашке
              <span className='transform group-hover:translate-x-1 transition-transform'>→</span>
            </Link>
          )}
        </div>

        {/* Тренажер */}
        <div className={`group relative rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
          trainerCompleted === plans.trainer.total
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-300'
        }`}>
          {/* Icon and Status Badge */}
          <div className='flex items-start gap-3 mb-3'>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              trainerCompleted === plans.trainer.total
                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                : 'bg-orange-500 shadow-lg shadow-orange-500/50'
            }`}>
              💪
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-1'>
                <h3 className='text-sm md:text-base font-bold text-gray-800'>
                  3. Тренажер
                </h3>
                {trainerCompleted === plans.trainer.total ? (
                  <span className='flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                    ✓ Готово
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full'>
                    {trainerCompleted}/{plans.trainer.total}
                  </span>
                )}
              </div>
              {/* Progress Bar */}
              <div className='w-full bg-white rounded-full h-2 mb-2 overflow-hidden shadow-inner'>
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    trainerCompleted === plans.trainer.total
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}
                  style={{ width: `${trainerProgress}%` }}
                />
              </div>
              <p className='text-xs text-gray-600'>
                {trainerCompleted} из {plans.trainer.total} заданий выполнено
              </p>
            </div>
          </div>
          {trainerCompleted < plans.trainer.total && (
            <Link
              to='/trainer'
              className='inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors bg-white px-3 py-2 rounded-lg hover:shadow-md'
            >
              Перейти к тренажеру
              <span className='transform group-hover:translate-x-1 transition-transform'>→</span>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}

