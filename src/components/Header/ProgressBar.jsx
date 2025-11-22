/**
 * Компонент прогресс-бара
 * Отображает прогресс выполнения планов на день
 * @param {number} progress - Прогресс в процентах (0-100)
 */
export default function ProgressBar({ progress = 0 }) {
  return (
    <div className='hidden md:flex items-center gap-2 ml-4'>
      <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
        <div 
          className='h-full bg-cyan-500 rounded-full transition-all duration-300' 
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        ></div>
      </div>
    </div>
  )
}

