import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePomodoro } from '../../contexts/PomodoroContext'
import { useGamification } from '../../hooks/useGamification'
import { FEATURES } from '../../constants/prices'

/**
 * Компактный Pomodoro таймер для Header
 * Показывается только если Pomodoro куплен
 */
export default function PomodoroTimer() {
  const navigate = useNavigate()
  const { isPurchased } = useGamification()
  const {
    timeLeftFormatted,
    isRunning,
    mode,
    start,
    pause,
    reset
  } = usePomodoro()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const isPurchasedPomodoro = isPurchased(FEATURES.POMODORO)
  
  // Если не куплен, показываем замок
  if (!isPurchasedPomodoro) {
    return (
      <button
        onClick={() => navigate('/gamification', { state: { highlight: 'pomodoro' } })}
        className='flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all shadow-md hover:shadow-lg bg-gray-300 hover:bg-gray-400 opacity-50'
        title='Купите Pomodoro таймер в Геймификации'
        aria-label='Pomodoro таймер заблокирован'
      >
        <svg 
          className='w-3 h-3 md:w-4 md:h-4 text-gray-600' 
          fill='currentColor' 
          viewBox='0 0 24 24'
        >
          <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
        </svg>
        <span className='font-mono font-semibold text-gray-700 text-xs md:text-sm'>
          --
        </span>
      </button>
    )
  }
  
  const isWork = mode === 'work'
  
  return (
    <div className='relative'>
      {/* Компактная кнопка таймера */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all hover:shadow-md active:scale-95 ${
          isWork
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
        }`}
        title={`Pomodoro: ${isWork ? 'Работа' : 'Отдых'} - ${timeLeftFormatted}`}
        aria-label={`Pomodoro таймер: ${timeLeftFormatted}`}
      >
        <span className='text-xs md:text-sm'>{isWork ? '⏱️' : '☕'}</span>
        <span className='font-mono font-semibold text-white text-xs md:text-sm'>
          {timeLeftFormatted}
        </span>
      </button>
      
      {/* Раскрывающаяся панель управления */}
      {isExpanded && (
        <>
          {/* Overlay для закрытия при клике вне */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Панель управления */}
          <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20 min-w-[200px]'>
            <div className='flex flex-col gap-2'>
              {/* Режим и время */}
              <div className='text-center pb-2 border-b border-gray-100'>
                <div className='text-lg mb-1'>{isWork ? '⏱️' : '☕'}</div>
                <div className='text-xs text-gray-600 mb-1'>
                  {isWork ? 'Работа' : 'Отдых'}
                </div>
                <div className='font-mono font-bold text-lg text-gray-900'>
                  {timeLeftFormatted}
                </div>
              </div>
              
              {/* Кнопки управления */}
              <div className='flex gap-2'>
                {isRunning ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      pause()
                    }}
                    className='flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-all'
                  >
                    Пауза
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      start()
                    }}
                    className='flex-1 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-xs font-medium hover:bg-cyan-600 transition-all'
                  >
                    Старт
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    reset()
                  }}
                  className='flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-all'
                >
                  Сброс
                </button>
              </div>
              
              {/* Кнопка открытия полной страницы */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                  navigate('/pomodoro')
                }}
                className='w-full px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-600 transition-all'
              >
                Открыть полный таймер →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

