export default function TeacherSummaryPanel({ homeworks, stats, onSelectHomework, onShowAll, onShowArchive }) {
  const now = new Date()
  const upcoming = [...homeworks]
    .filter((hw) => hw.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)
  const overdue = homeworks.filter((hw) => new Date(hw.dueDate) < now && (stats[hw.id]?.pending || 0) > 0)

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-lg font-semibold text-gray-900'>Ближайшие дедлайны</h3>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={onShowArchive}
              className='text-sm font-semibold text-cyan-800 hover:text-cyan-900 underline'
            >
              архив
            </button>
            <button
              type='button'
              onClick={onShowAll}
              className='text-sm font-semibold text-cyan-800 hover:text-cyan-900 underline'
            >
              все задания
            </button>
          </div>
        </div>
        {overdue.length > 0 && (
          <div className='text-xs text-red-600'>Просрочено: {overdue.length}</div>
        )}
        {upcoming.length === 0 ? (
          <p className='text-sm text-gray-500'>Нет назначенных дедлайнов</p>
        ) : (
          <div className='space-y-2'>
            {upcoming.map((hw) => (
              <button
                key={hw.id}
                type='button'
                onClick={() => onSelectHomework?.(hw.id)}
                className='w-full text-left rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 hover:border-cyan-200 transition'
              >
                <p className='text-sm font-semibold text-gray-800'>{hw.title}</p>
                <p className='text-xs text-gray-600'>Срок: {hw.dueDate}</p>
                <p className='text-xs text-gray-600'>
                  Сдано {stats[hw.id]?.submitted || 0} / {stats[hw.id]?.assigned || 0}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

