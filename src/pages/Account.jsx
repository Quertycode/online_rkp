import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getUserFull, logout } from '../utils/userStore'
import ContactSettings from '../modules/account/components/ContactSettings'
import SecuritySettings from '../modules/account/components/SecuritySettings'
import Card from '../components/Card'

/**
 * Страница аккаунта - Редизайн
 */
export default function Account() {
  const user = getCurrentUser()
  const fullUser = user?.username ? getUserFull(user.username) : null
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setTimeout(() => navigate('/'), 10)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Вы не авторизованы</h2>
            <p className="text-gray-500 mt-2">Пожалуйста, войдите в систему</p>
         </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-fade">
      <div className="space-y-6">
        <Card title="Настройки аккаунта" className="h-full">
          <div className="space-y-8">
            <ContactSettings user={fullUser || user} />
            <div className="border-t border-gray-100 pt-6">
               <SecuritySettings user={fullUser || user} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}
