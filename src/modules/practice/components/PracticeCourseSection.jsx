import PracticeTaskList from './PracticeTaskList'

export default function PracticeCourseSection({ course, onComplete, onReset }) {
  const { code, title, accessible, tasks, stats, completed } = course
  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)

  return (
    <div className='border border-cyan-100 rounded-2xl bg-white/70 shadow-sm p-4 space-y-4'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                accessible
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {accessible ? 'Доступ открыт' : 'Доступ закрыт'}
            </span>
          </div>
          <p className='text-sm text-gray-600'>
            {accessible
              ? 'Можно переходить к занятиям и заданиям.'
              : 'Обратитесь к администратору, чтобы получить доступ к заданиям.'}
          </p>
        </div>

        <div className='w-full md:w-72 bg-white border border-cyan-100 rounded-xl p-3 flex flex-col gap-2'>
          <div className='flex items-center justify-between text-xs text-gray-700'>
            <span>Прогресс</span>
            <span className='font-semibold text-cyan-700'>{progress}%</span>
          </div>
          <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-500 transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='text-[11px] text-gray-500'>
            Выполнено {stats.completed} из {stats.total}
          </div>
        </div>
      </div>

      {accessible ? (
        <PracticeTaskList
          tasks={tasks}
          subject={code}
          completedSet={completed}
          onComplete={onComplete}
          onReset={onReset}
        />
      ) : (
        <div className='rounded-xl border border-gray-200 bg-gray-50 text-gray-600 p-4'>
          Доступ к заданиям не открыт.
        </div>
      )}
    </div>
  )
}

