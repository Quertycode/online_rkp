import { Link } from 'react-router-dom'

export default function PracticeTaskCard({
  task,
  subject,
  completed,
  displayIndex,
  onComplete,
  onReset,
}) {
  const statusColor = completed ? 'border-green-200 bg-green-50' : 'border-cyan-200 bg-white'
  const linkTo = `/courses/${subject}/${task.lessonId}`

  const handleComplete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onComplete(task)
  }

  const handleReset = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onReset(task)
  }

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition hover:shadow-md ${statusColor}`}
      style={{ minHeight: '140px' }}
    >
      <Link to={linkTo} className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='px-2 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-sm shrink-0 inline-flex items-center'>
              Задание {displayIndex || 1}
            </span>
          </div>
          <p className='text-base text-gray-700 line-clamp-5 leading-snug'>{task.question}</p>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
              completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {completed ? 'Выполнено' : 'Не выполнено'}
          </span>
        </div>
      </Link>

    </div>
  )
}


