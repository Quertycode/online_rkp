import { useNavigate } from 'react-router-dom'
import { useGamification } from '../../hooks/useGamification'

/**
 * Кнопка с балансом энергии в Header (компактная версия)
 * При клике переходит на страницу геймификации
 */
export default function CoinsButton() {
  const navigate = useNavigate()
  const { coins } = useGamification()
  
  return (
    <button
      onClick={() => navigate('/gamification')}
      className='flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all hover:shadow-md active:scale-95'
      title='Геймификация'
      aria-label='Открыть страницу геймификации'
    >
      <span className='text-sm'>⚡</span>
      <span className='font-semibold text-gray-900 text-xs'>
        {coins}
      </span>
    </button>
  )
}

