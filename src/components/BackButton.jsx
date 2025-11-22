import { useLocation, useNavigate } from 'react-router-dom'

export default function BackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Не показываем кнопку на главной странице, логине и 404
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/404') {
    return null
  }

  const handleBack = () => {
    // Если пришли с header, находимся на account или gamification, идем на главную
    if (location.state?.fromHeader || location.pathname === '/account' || location.pathname === '/gamification') {
      navigate('/')
    } else {
      // Иначе возвращаемся назад
      navigate(-1)
    }
  }

  const isFromHeader = location.state?.fromHeader || location.pathname === '/account' || location.pathname === '/gamification'

  return (
    <div className='fixed left-2 md:left-4 top-24 z-10'>
      <button
        onClick={handleBack}
        className='inline-flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-800 transition-colors'
        title={isFromHeader ? 'На главную' : 'Назад'}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={2}
          stroke='currentColor'
          className='w-5 h-5 md:w-6 md:h-6'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
        </svg>
        <span className='text-xs md:text-sm hidden xl-custom:inline whitespace-nowrap'>
          {isFromHeader ? 'На главную' : 'Назад'}
        </span>
      </button>
    </div>
  )
}

