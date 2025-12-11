import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Компонент выпадающего списка уведомлений
 * @param {boolean} isOpen - Открыт ли dropdown
 * @param {function} onClose - Функция закрытия
 * @param {Array} notifications - Массив уведомлений
 * @param {number} unreadCount - Количество непрочитанных
 * @param {string} username - Username пользователя
 * @param {function} onMarkAsRead - Функция отметки как прочитанного
 * @param {function} onClearAll - Функция очистки всех уведомлений
 */
export default function NotificationsDropdown({ 
  isOpen, 
  onClose, 
  notifications = [], 
  unreadCount = 0, 
  username = '', 
  onMarkAsRead,
  onClearAll
}) {
  const dropdownRef = useRef(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const navigate = useNavigate()

  // Проверяем размер экрана
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1835)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNotificationClick = (notification) => {
    if (notification.unread && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  const handleClearClick = () => {
    if (onClearAll) {
      onClearAll()
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${isSmallScreen ? 'left-0 -translate-x-1.5' : 'right-0 translate-x-1.5'} mt-2 w-80 bg-white border border-gray-100 shadow-lg rounded-xl overflow-visible z-50`}
    >
      {/* Треугольный указатель */}
      <div className={`absolute -top-1.5 ${isSmallScreen ? 'left-4' : 'right-4'} w-3 h-3 bg-white border-l border-t border-gray-100 transform rotate-45`}></div>
      
      <div className='bg-white rounded-xl overflow-hidden'>
        <div className='p-3 border-b border-gray-100 font-semibold text-gray-800 text-center'>
          Уведомления{unreadCount > 0 && <span className='ml-2 text-sm text-gray-500 font-normal'>({unreadCount})</span>}
        </div>
        <ul className='max-h-60 overflow-y-auto'>
          {notifications.length === 0 ? (
            <li className='px-4 py-8 text-center text-gray-400 text-sm'>
              Нет уведомлений
            </li>
          ) : (
            notifications.map((notification) => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-cyan-500/7 ${
                  notification.unread 
                    ? 'bg-cyan-500/5 border-l-[3px] border-cyan-500' 
                    : ''
                }`}
              >
                {notification.emoji} {notification.text}
              </li>
            ))
          )}
        </ul>
        {notifications.length > 0 && (
          <button
            type='button'
            onClick={handleClearClick}
            className='w-full p-3 text-center text-sm text-red-600 hover:text-red-700 border-t border-gray-100 transition-colors duration-200'
          >
            Очистить уведомления
          </button>
        )}
      </div>
    </div>
  )
}

