import { Link } from 'react-router-dom'

/**
 * Карточка задания по занятию (кликабельная)
 * @param {Object} task - Объект задания
 * @param {string|Object} answer - Сохранённый ответ (если есть)
 * @param {string} subject - Код предмета
 * @param {string|number} lessonId - ID занятия
 * @param {boolean} focused - Подсветка выбранной карточки
 */
export default function TaskCard({ task, answer, subject, lessonId, focused }) {
  const taskType =
    task.taskType ||
    (Array.isArray(task.questions) && task.questions.length ? 'test' : 'assignment')
  const isAssignment = taskType === 'assignment'

  const hasAnswer = (() => {
    if (!answer) return false
    if (typeof answer === 'string') return Boolean(answer.trim())
    if (Array.isArray(answer.questions)) {
      return answer.questions.length > 0 && answer.questions.every((q) => Boolean(q?.answer?.trim?.()))
    }
    return Boolean(answer.comment) || Boolean(answer.fileName) || Boolean(answer.status === 'success')
  })()

  const completed = hasAnswer
  const linkTo = `/tasks/${task.id}`

  return (
    <Link
      to={linkTo}
      state={{ focusTaskId: task.id, subject, lessonId, fromLesson: true }}
      className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-2 transition hover:shadow-md ${
        completed ? 'border-green-200 bg-green-50' : 'border-cyan-200 bg-white'
      } ${focused ? 'ring-2 ring-cyan-400' : ''}`}
      style={{ minHeight: '140px' }}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='px-2 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-xs shrink-0'>
            {isAssignment ? 'Практикум' : 'Тестирование'}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
            completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {completed ? 'Выполнено' : 'Не выполнено'}
        </span>
      </div>
      <p className='text-base text-gray-800 leading-snug whitespace-pre-line'>
        {task.question}
      </p>
    </Link>
  )
}

