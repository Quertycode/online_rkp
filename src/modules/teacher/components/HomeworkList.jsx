import { getSubjectName } from '../../../constants/subjects'

export default function HomeworkList({ homeworks, stats, loading, onDelete, students = [], submissions = {}, onFeedback, highlightId }) {
  if (loading) {
    return <div className='rounded-2xl border border-cyan-100 p-4 bg-white'>Загружаем...</div>
  }

  if (!homeworks.length) {
    return (
      <div className='rounded-2xl border border-dashed border-cyan-200 p-6 bg-white text-center'>
        <p className='text-sm text-gray-600'>Пока нет заданий. Создайте первое.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      {homeworks.map((hw) => {
        const stat = stats[hw.id] || { assigned: 0, submitted: 0, graded: 0, pending: 0 }
        const recipients = hw.assignAll ? students.map((s) => s.id) : hw.assigneeIds
        const submissionList = submissions[hw.id] || []
        const submittedIds = submissionList.filter((s) => s.status !== 'draft').map((s) => s.studentId)
        const notSubmitted = recipients.filter((id) => !submittedIds.includes(id))
        return (
          <div
            key={hw.id}
            id={`hw-${hw.id}`}
            className={`rounded-2xl border border-cyan-100 p-4 bg-white shadow-sm transition duration-200 ease-out hover:shadow-md flex flex-col h-full ${
              highlightId === hw.id ? 'ring-2 ring-offset-2 ring-cyan-300 shadow-md' : ''
            }`}
          >
            <div className='flex items-start justify-between gap-2'>
              <div>
                <p className='text-xs uppercase text-cyan-700/70 tracking-wide'>
                  {hw.type === 'test' && 'Тест'}
                  {hw.type === 'open' && 'Открытое'}
                  {hw.type === 'mixed' && 'Тест + открытое'}
                </p>
                <h4 className='text-lg font-semibold text-gray-900'>{hw.title}</h4>
                <p className='text-sm text-gray-600'>{getSubjectName(hw.courseId)}</p>
              </div>
              <div className='text-right text-xs text-gray-600'>
                <p>Срок</p>
                <p className='font-semibold text-cyan-800'>{hw.dueDate}</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2 text-sm'>
              <StatPill label='Назначено' value={stat.assigned} />
              <StatPill label='Сдано' value={stat.submitted} />
              <StatPill label='Проверено' value={stat.graded} />
              <StatPill label='В работе' value={stat.pending} />
            </div>

            <div className='text-xs text-gray-500'>
              {hw.assignAll ? 'Всем привязанным студентам' : `${hw.assigneeIds.length} выбранных студентов`}
            </div>

            {submissionList.length > 0 && (
              <div className='text-sm text-gray-700 space-y-1'>
                <p className='font-semibold text-gray-800'>Отправили:</p>
                <div className='flex flex-wrap gap-2'>
                  {submittedIds.map((id) => (
                    <span key={id} className='px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs border border-green-200'>
                      {students.find((s) => s.id === id)?.name || id}
                      {(() => {
                        const sub = submissionList.find((s) => s.studentId === id)
                        return sub?.grade ? ` · ${sub.grade}` : ''
                      })()}
                      {onFeedback && (
                        <button
                          type='button'
                          className='ml-2 text-[10px] text-cyan-700 underline'
                          onClick={() => {
                            const text = prompt('Комментарий студенту')
                            if (text) onFeedback(hw.id, id, text)
                          }}
                        >
                          Комментарий
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <p className='font-semibold text-gray-800 mt-2'>Не отправили:</p>
                <div className='flex flex-wrap gap-2'>
                  {notSubmitted.map((id) => (
                    <span key={id} className='px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs border border-yellow-200'>
                      {students.find((s) => s.id === id)?.name || id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className='flex justify-end pt-2 mt-auto'>
              <button
                type='button'
                onClick={() => onDelete(hw.id)}
                className='text-sm text-red-600 hover:text-red-700'
              >
                Удалить задание
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className='rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 flex items-center justify-between'>
      <span className='text-gray-600'>{label}</span>
      <span className='font-semibold text-cyan-800'>{value}</span>
    </div>
  )
}

