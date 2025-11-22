import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePomodoro } from '../contexts/PomodoroContext'
import { useGamification } from '../hooks/useGamification'
import { FEATURES } from '../constants/prices'

/**
 * Страница Pomodoro таймера
 * Доступна только после покупки
 */
export default function PomodoroTimer() {
  const navigate = useNavigate()
  const { isPurchased } = useGamification()
  const {
    timeLeftFormatted,
    isRunning,
    mode,
    sessionsCompleted,
    progress,
    start,
    pause,
    reset,
    switchMode,
    requestNotificationPermission
  } = usePomodoro()
  
  // Проверяем, куплен ли Pomodoro
  useEffect(() => {
    if (!isPurchased(FEATURES.POMODORO)) {
      navigate('/gamification')
    }
  }, [isPurchased, navigate])
  
  // Запрашиваем разрешение на уведомления при монтировании
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])
  
  const isWork = mode === 'work'
  
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-200px)]'>
      <div className='w-full max-w-2xl'>
        {/* Карточка таймера */}
        <div className={`rounded-2xl p-8 md:p-12 shadow-2xl transition-all duration-500 ${
          isWork
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}>
          {/* Заголовок */}
          <div className='text-center mb-8'>
            <div className='text-6xl mb-4'>
              {isWork ? '⏱️' : '☕'}
            </div>
            <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
              {isWork ? 'Время работы' : 'Время отдыха'}
            </h1>
            <p className='text-white/80 text-lg'>
              {isWork 
                ? 'Сконцентрируйся на задаче' 
                : 'Расслабься и отдохни'}
            </p>
          </div>
          
          {/* Таймер */}
          <div className='relative mb-8'>
            {/* Круговой прогресс */}
            <div className='relative w-64 h-64 mx-auto'>
              <svg className='transform -rotate-90 w-64 h-64'>
                <circle
                  cx='128'
                  cy='128'
                  r='120'
                  stroke='rgba(255,255,255,0.2)'
                  strokeWidth='8'
                  fill='none'
                />
                <circle
                  cx='128'
                  cy='128'
                  r='120'
                  stroke='white'
                  strokeWidth='8'
                  fill='none'
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  strokeLinecap='round'
                  className='transition-all duration-1000'
                />
              </svg>
              
              {/* Время в центре */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-6xl md:text-7xl font-bold text-white tabular-nums'>
                    {timeLeftFormatted}
                  </div>
                  <div className='text-white/60 text-sm mt-2'>
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Кнопки управления */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-6'>
            {!isRunning ? (
              <button
                onClick={start}
                className='px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg'
              >
                ▶ Старт
              </button>
            ) : (
              <button
                onClick={pause}
                className='px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg'
              >
                ⏸ Пауза
              </button>
            )}
            
            <button
              onClick={reset}
              className='px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all'
            >
              🔄 Сброс
            </button>
            
            <button
              onClick={switchMode}
              className='px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all'
            >
              {isWork ? '☕ Перерыв' : '⏱️ Работа'}
            </button>
          </div>
          
          {/* Статистика */}
          <div className='text-center'>
            <div className='inline-block bg-white/20 rounded-lg px-6 py-3'>
              <span className='text-white/80 text-sm'>Завершено сессий сегодня:</span>
              <span className='text-white text-2xl font-bold ml-3'>
                {sessionsCompleted}
              </span>
            </div>
          </div>
        </div>
        
        {/* Инструкция */}
        <div className='mt-6 bg-white rounded-xl p-6 shadow-lg'>
          <h3 className='font-bold text-gray-900 mb-3'>
            📚 Техника Pomodoro
          </h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-500 font-bold'>1.</span>
              <span>Работай 25 минут без отвлечений</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-500 font-bold'>2.</span>
              <span>Отдохни 5 минут</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-cyan-500 font-bold'>3.</span>
              <span>После 4 сессий сделай длинный перерыв (15-30 минут)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

