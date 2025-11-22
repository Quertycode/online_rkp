import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Модальное окно подтверждения
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    // Блокируем скролл при открытом модальном окне
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.position = 'fixed'
    document.documentElement.style.top = `-${scrollY}px`
    document.documentElement.style.width = '100%'
    // Компенсируем ширину скроллбара, чтобы контент не съезжал
    document.body.style.paddingRight = `${scrollbarWidth}px`
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Восстанавливаем скролл
      document.documentElement.style.overflow = ''
      document.documentElement.style.position = ''
      document.documentElement.style.top = ''
      document.documentElement.style.width = ''
      document.body.style.paddingRight = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen, onCancel])
  
  if (!isOpen) return null
  
  const modalContent = (
    <div 
      className='fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4'
      onClick={onCancel}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', pointerEvents: 'auto' }}
    >
      {/* Модальное окно */}
      <div 
        className='bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-[fadeIn_0.2s_ease-out] relative z-[10002]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <h3 className='text-xl font-bold text-gray-900 mb-4'>
          {title}
        </h3>
        
        {/* Сообщение */}
        <p className='text-gray-600 mb-6'>
          {message}
        </p>
        
        {/* Кнопки */}
        <div className='flex gap-3 justify-end'>
          <button
            onClick={onCancel}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all'
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-all'
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
  
  return createPortal(modalContent, document.body)
}

