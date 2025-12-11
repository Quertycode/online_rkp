import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getCurrentUser, getUserFull, getNotifications, getUnreadCount, markNotificationAsRead, clearNotifications } from '../utils/userStore'
import UserProfileButton from './Header/UserProfileButton'
import NotificationButton from './Header/NotificationButton'
import Navigation from './Header/Navigation'
import Logo from './Header/Logo'

/**
 * Главный компонент Header
 * Рефакторинг: Разбит на модульные компоненты
 */
export default function Header() {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [fullUser, setFullUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Обновляем пользователя при изменении location (для обновления после авторизации/выхода)
  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      setFullUser(getUserFull(currentUser.username))
      setNotifications(getNotifications(currentUser.username))
      setUnreadCount(getUnreadCount(currentUser.username))
    } else {
      setFullUser(null)
      setNotifications([])
      setUnreadCount(0)
    }
  }, [location]) // Обновляем при изменении роута
  
  // Обработчик для отметки уведомления как прочитанного
  const handleMarkAsRead = (notificationId) => {
    if (user) {
      markNotificationAsRead(user.username, notificationId)
      // Обновляем локальное состояние без перезагрузки страницы
      setNotifications(getNotifications(user.username))
      setUnreadCount(getUnreadCount(user.username))
    }
  }

  const handleClearNotifications = () => {
    if (user) {
      clearNotifications(user.username)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  return (
    <header className='sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-cyan-100 min-h-16'>
      <div className='w-full max-w-[1600px] mx-auto px-4 md:px-6 py-2 md:py-0 md:h-16 flex flex-col md:flex-row items-start md:items-center justify-between relative'>
        {user ? (
          <>
            {/* Для авторизованных: полный Header */}
            <div className='w-full md:w-auto flex items-center justify-between mb-2 md:mb-0 order-2 md:order-1 gap-3 md:gap-4'>
              <UserProfileButton user={user} fullUser={fullUser} />
              <NotificationButton 
                unreadCount={unreadCount}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearNotifications}
              />
            </div>

            <div className='absolute left-1/2 -translate-x-1/2 top-2 md:top-0 md:h-full flex items-center order-1 md:order-2'>
              <Logo />
            </div>

            <Navigation />
          </>
        ) : (
          <>
            {/* Для неавторизованных: только логотип по центру */}
            <div className='w-full flex justify-center items-center'>
              <Logo />
            </div>
          </>
        )}
      </div>
    </header>
  )
}
