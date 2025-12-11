import { Link } from 'react-router-dom'

export default function PracticeTaskCard({
  task,
  subject,
  completed,
  onComplete,
  onReset,
}) {
  const taskType =
    task.taskType ||
    (task.subject === 'pract_psychology' && Number(task.id) % 2 === 0 ? 'assignment' : 'test')
  const statusColor = completed ? 'border-green-200 bg-green-50' : 'border-cyan-200 bg-white'
  const linkTo = `/tasks/${task.id}`

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition hover:shadow-md ${statusColor}`}
      style={{ minHeight: '140px' }}
    >
      <Link
        to={linkTo}
        state={{ focusTaskId: task.id, subject, lessonId: task.lessonId, fromPractice: true }}
        className='flex items-start justify-between gap-3'
      >
        <div className='space-y-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='px-2 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-xs shrink-0 inline-flex items-center'>
              {taskType === 'assignment' ? 'Практикум' : 'Тестирование'}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {completed ? 'Выполнено' : 'Не выполнено'}
            </span>
          </div>
          <p className='text-base text-gray-700 leading-snug whitespace-pre-line'>{task.question}</p>
        </div>
      </Link>
    </div>
  )
}


