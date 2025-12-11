import { Link } from 'react-router-dom'

/**
 * Карточка урока
 * @param {Object} lesson - Объект урока
 * @param {string} subject - Предмет
 * @param {Object} progress - Прогресс урока
 */
export default function LessonCard({ lesson, subject, progress, totalTasks = 0, completedTasks = 0 }) {
  const hasPractice = totalTasks > 0
  const practiceDone = hasPractice && completedTasks >= totalTasks
  const isCompleted = progress.watched && (practiceDone || !hasPractice)
  const practiceStatusDone = hasPractice ? practiceDone : progress.watched
  const practiceLabel =
    !hasPractice
      ? 'Практика отсутствует'
      : practiceDone
        ? 'Практика выполнена'
        : `Практические задания ${completedTasks}/${totalTasks}`

  return (
    <Link
      to={`/courses/${subject}/${lesson.id}`}
      className={`block border rounded-xl p-4 transition hover:shadow-md ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-cyan-200 bg-white'
      }`}
    >
      <div className='flex items-start justify-between gap-3 text-sm text-gray-600 mb-2 flex-wrap'>
        <span className='px-2 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800'>
          Занятие {lesson.order || lesson.id}
        </span>
        <span className='font-semibold text-lg text-gray-900 hover:text-cyan-700 transition-colors'>
          {lesson.title}
        </span>
        <span className='text-gray-700 ml-auto'>
          Преподаватель:{' '}
          <span className='font-medium'>
            {lesson.teacherName || lesson.teacher || 'не назначен'}
          </span>
        </span>
      </div>
      {lesson.description && (
        <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{lesson.description}</p>
      )}
      <div className='flex gap-4 text-sm text-gray-600 flex-wrap'>
        <span
          className={`flex items-center gap-1 ${
            progress.watched ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              progress.watched ? 'bg-green-500' : 'bg-gray-300'
            }`}
          ></span>
          Видео {progress.watched ? 'просмотрено' : 'не просмотрено'}
        </span>
        <span className={`flex items-center gap-1 ${practiceStatusDone ? 'text-green-600' : 'text-gray-500'}`}>
          <span
            className={`w-2 h-2 rounded-full ${practiceStatusDone ? 'bg-green-500' : 'bg-gray-300'}`}
          ></span>
          {practiceLabel}
        </span>
      </div>
    </Link>
  )
}

