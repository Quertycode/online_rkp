import { useEffect } from 'react'

/**
 * Компонент Toast уведомления
 */
export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [onClose, duration])
  
  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
    ? 'bg-red-500' 
    : 'bg-blue-500'
  
  return (
    <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out translate-x-0 opacity-100`}>
      <span className='text-xl'>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span className='flex-1 text-sm font-medium'>{message}</span>
      <button
        onClick={onClose}
        className='text-white/80 hover:text-white transition-colors'
        aria-label='Закрыть'
      >
        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    </div>
  )
}

