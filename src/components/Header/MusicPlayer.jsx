import { useNavigate } from 'react-router-dom'
import { useMusic } from '../../hooks/useMusic'

/**
 * Компонент музыкального плеера для lo-fi музыки
 * Кнопка play/pause с иконками
 */
export default function MusicPlayer() {
  const navigate = useNavigate()
  const { isPlaying, isLoading, isUnlocked, togglePlay } = useMusic()
  
  const handleClick = () => {
    if (!isUnlocked) {
      navigate('/gamification', { state: { highlight: 'music' } })
    } else {
      togglePlay()
    }
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading && isUnlocked}
      className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-all shadow-md hover:shadow-lg ${
        !isUnlocked
          ? 'bg-gray-300 hover:bg-gray-400 opacity-50'
          : 'bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
      title={!isUnlocked ? 'Купите "Фоновая музыка" в Геймификации' : (isPlaying ? 'Пауза' : 'Включить lo-fi музыку')}
      aria-label={!isUnlocked ? 'Функция заблокирована' : (isPlaying ? 'Поставить на паузу' : 'Воспроизвести музыку')}
    >
      {!isUnlocked ? (
        // Иконка замка (заблокировано)
        <svg 
          className='w-3 h-3 md:w-4 md:h-4 text-gray-600' 
          fill='currentColor' 
          viewBox='0 0 24 24'
        >
          <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
        </svg>
      ) : isLoading ? (
        // Индикатор загрузки
        <svg 
          className='w-3 h-3 md:w-4 md:h-4 text-white animate-spin' 
          fill='none' 
          viewBox='0 0 24 24'
        >
          <circle 
            className='opacity-25' 
            cx='12' 
            cy='12' 
            r='10' 
            stroke='currentColor' 
            strokeWidth='4'
          />
          <path 
            className='opacity-75' 
            fill='currentColor' 
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      ) : isPlaying ? (
        // Иконка Pause
        <svg 
          className='w-3 h-3 md:w-4 md:h-4 text-white' 
          fill='currentColor' 
          viewBox='0 0 24 24'
        >
          <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
        </svg>
      ) : (
        // Иконка Play
        <svg 
          className='w-3 h-3 md:w-4 md:h-4 text-white ml-0.5' 
          fill='currentColor' 
          viewBox='0 0 24 24'
        >
          <path d='M8 5v14l11-7z' />
        </svg>
      )}
    </button>
  )
}

