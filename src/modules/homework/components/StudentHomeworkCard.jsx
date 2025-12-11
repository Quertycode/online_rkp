import { getSubjectName } from '../../../constants/subjects'

export default function StudentHomeworkCard({ homework, submission, onOpen }) {
  const status = submission?.status || 'draft'
  const isOverdue = new Date(homework.dueDate) < new Date() && status !== 'graded' && status !== 'submitted'
  const badge = {
    draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    submitted: 'bg-green-50 text-green-700 border-green-200',
    graded: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  }[status]

  return (
    <div className='rounded-2xl border border-cyan-100 p-4 bg-white shadow-sm space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <p className='text-xs uppercase text-cyan-700/70 tracking-wide'>
            {homework.type === 'test' ? 'Тест' : 'Открытое'}
          </p>
          <h3 className='text-lg font-semibold text-gray-900'>{homework.title}</h3>
          <p className='text-sm text-gray-600'>{getSubjectName(homework.courseId)}</p>
        </div>
        <div className='text-right'>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${badge}`}>
            {status === 'draft' && (isOverdue ? 'Просрочено' : 'В процессе')}
            {status === 'submitted' && 'Отправлено'}
            {status === 'graded' && 'Проверено'}
          </div>
          <p className='text-xs text-gray-500 mt-2'>Срок: {homework.dueDate}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={onOpen}
        className='w-full rounded-lg bg-cyan-600 text-white py-2 text-sm font-semibold hover:bg-cyan-700 transition'
      >
        Открыть задание
      </button>
    </div>
  )
}

