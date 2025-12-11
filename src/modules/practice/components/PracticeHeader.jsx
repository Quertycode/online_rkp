import { useState } from 'react'

export default function PracticeHeader({ courseTitle, stats, courseOptions = [], selectedCourse, onSelectCourse }) {
  const [open, setOpen] = useState(false)
  const hasMultiple = courseOptions.length > 1
  const currentTitle =
    courseOptions.find((c) => c.code === selectedCourse)?.title || courseTitle || 'Выберите курс'

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between relative'>
      <div>
        {hasMultiple ? (
          <div className='relative'>
            <button
              type='button'
              onClick={() => setOpen((v) => !v)}
              className='text-left text-2xl font-semibold text-gray-900 flex items-center gap-2 hover:text-cyan-700 transition'
            >
              {currentTitle}
              <span className={`text-sm transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            {open && (
              <div className='absolute z-10 mt-2 w-72 bg-white border border-cyan-100 rounded-2xl shadow-lg p-2'>
                {courseOptions.map(({ code, title }) => (
                  <button
                    key={code}
                    type='button'
                    onClick={() => {
                      onSelectCourse?.(code)
                      setOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                      code === selectedCourse
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <h1 className='text-2xl font-semibold text-gray-900'>{currentTitle}</h1>
        )}
      </div>

      <div className='w-full md:w-80 bg-white border border-cyan-100 rounded-2xl shadow-sm p-4 flex flex-col gap-2'>
        <div className='flex items-center justify-between text-sm text-gray-700'>
          <span>Прогресс</span>
          <span className='font-semibold text-cyan-700'>
            {stats.total === 0 ? '0%' : `${Math.round((stats.completed / stats.total) * 100)}%`}
          </span>
        </div>
        <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-500 transition-all duration-300'
            style={{
              width: `${stats.total === 0 ? 0 : (stats.completed / stats.total) * 100}%`,
            }}
          />
        </div>
        <div className='text-xs text-gray-500'>
          Выполнено {stats.completed} из {stats.total}
        </div>
      </div>
    </div>
  )
}


