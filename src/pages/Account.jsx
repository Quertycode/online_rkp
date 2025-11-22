import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getStats, getUserFull, logout } from '../utils/userStore'
import ProfileCard from '../modules/account/components/ProfileCard'
import StatsCard from '../modules/account/components/StatsCard'

/**
 * Страница аккаунта - композиция модульных компонентов
 * Рефакторинг: Разбита на модульные компоненты
 * 
 * Примечание: Настройки музыки перенесены в раздел Геймификации
 */
export default function Account() {
  const user = getCurrentUser()
  const identifier = user?.username || user?.email || 'guest-anon'
  const fullUser = user?.username ? getUserFull(user.username) : null
  const stats = getStats(identifier)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    // Небольшая задержка для очистки состояния перед навигацией
    setTimeout(() => {
      navigate('/')
    }, 10)
  }

  return (
    <div className='space-y-4'>
      <ProfileCard user={user} fullUser={fullUser} onLogout={handleLogout} />
      <StatsCard stats={stats} />
    </div>
  )
}
