import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGamification } from '../hooks/useGamification'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../components/ToastContainer'
import ConfirmModal from '../components/ConfirmModal'
import { getCurrentUser } from '../utils/userStore'
import { addCoins, resetPurchases, resetCoins } from '../utils/gamificationStore'
import LeaderboardCard from '../modules/gamification/components/LeaderboardCard'
import PomodoroCard from '../modules/gamification/components/PomodoroCard'
import MusicCard from '../modules/gamification/components/MusicCard'
import ThemesCard from '../modules/gamification/components/ThemesCard'

/**
 * Страница геймификации
 * Содержит рейтинг, покупки функций (Pomodoro, музыка, темы)
 */
export default function Gamification() {
  const location = useLocation()
  const [highlightModule, setHighlightModule] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, feature: null, price: null })
  const {
    coins,
    streak,
    longestStreak,
    leaderboard,
    purchase,
    isPurchased,
    refresh
  } = useGamification()
  
  const { currentTheme, changeTheme } = useTheme()
  const { showToast } = useToast()
  
  // Обработка подсветки модуля при переходе из Header
  useEffect(() => {
    if (location.state?.highlight) {
      setHighlightModule(location.state.highlight)
      
      // Сбрасываем подсветку через 1.5 секунды с плавным переходом
      const timer = setTimeout(() => {
        setHighlightModule(null)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [location.state])
  
  // Обработчик покупки
  const handlePurchase = (feature, price) => {
    // Показываем модальное окно подтверждения
    setConfirmModal({ isOpen: true, feature, price })
  }
  
  // Подтверждение покупки
  const handleConfirmPurchase = () => {
    const { feature, price } = confirmModal
    setConfirmModal({ isOpen: false, feature: null, price: null })
    
    const result = purchase(feature, price)
    
    if (result.success) {
      showToast('Куплено!', 'success')
      refresh()
    } else {
      showToast(result.error, 'error')
    }
  }
  
  // Отмена покупки
  const handleCancelPurchase = () => {
    setConfirmModal({ isOpen: false, feature: null, price: null })
  }
  
  // Обработчик смены темы
  const handleThemeChange = (themeId) => {
    changeTheme(themeId)
  }
  
  // Тестовые функции
  const handleAddCoins = () => {
    const user = getCurrentUser()
    if (user?.username) {
      addCoins(user.username, 10000, 'test_add_coins')
      refresh()
      alert('✅ Добавлено 10000 энергии!')
    }
  }
  
  const handleResetPurchases = () => {
    const user = getCurrentUser()
    if (user?.username) {
      if (confirm('⚠️ Вы уверены, что хотите сбросить все открытые модули?')) {
        resetPurchases(user.username)
        refresh()
        alert('✅ Все покупки сброшены!')
      }
    }
  }
  
  const handleResetCoins = () => {
    const user = getCurrentUser()
    if (user?.username) {
      if (confirm('⚠️ Вы уверены, что хотите сбросить всю энергию к 0?')) {
        resetCoins(user.username)
        refresh()
        alert('✅ Энергия сброшена к 0!')
      }
    }
  }
  
  return (
    <div className='space-y-6'>
      {/* Заголовок с балансом */}
      <div className='bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-white'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>🎮 Геймификация</h1>
            <p className='text-cyan-100'>
              Зарабатывай энергию и открывай новые возможности!
            </p>
          </div>
          
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Баланс */}
            <div className='bg-white/20 backdrop-blur rounded-lg px-6 py-3 text-center'>
              <div className='text-2xl font-bold mb-1 flex items-center justify-center gap-2'>
                {coins}
                <span className='text-yellow-300'>⚡</span>
              </div>
              <div className='text-xs text-cyan-100'>Энергия</div>
            </div>
            
            {/* Streak */}
            <div className='bg-white/20 backdrop-blur rounded-lg px-6 py-3 text-center'>
              <div className='text-2xl font-bold mb-1 flex items-center justify-center gap-2'>
                {streak}
                <span>🔥</span>
              </div>
              <div className='text-xs text-cyan-100'>
                Дней подряд (рекорд: {longestStreak})
              </div>
            </div>
          </div>
        </div>
        
        {/* Подсказки по заработку энергии */}
        <div className='mt-6 pt-6 border-t border-white/20'>
          <p className='text-sm text-cyan-100 mb-3 font-medium'>
            Как заработать энергию:
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
            <div className='bg-white/10 rounded-lg p-3'>
              <span className='font-semibold'>+10 ⚡</span> За выполнение плана на день
            </div>
            <div className='bg-white/10 rounded-lg p-3'>
              <span className='font-semibold'>+1 ⚡</span> За 10 заданий в тренажере
            </div>
            <div className='bg-white/10 rounded-lg p-3'>
              <span className='font-semibold'>+50 ⚡</span> За 5 дней подряд
            </div>
          </div>
        </div>
      </div>

      {/* Рейтинг (полная ширина) */}
      <div className='grid grid-cols-1'>
        <LeaderboardCard leaderboard={leaderboard} />
      </div>

      {/* Функции геймификации (3 карточки в ряд) */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
        {/* Pomodoro */}
        <PomodoroCard
          coins={coins}
          isPurchased={isPurchased('pomodoro_timer')}
          onPurchase={handlePurchase}
          isHighlighted={highlightModule === 'pomodoro'}
        />
        
        {/* Музыка */}
        <MusicCard
          coins={coins}
          hasPurchasedTrack={isPurchased}
          onPurchase={handlePurchase}
          isHighlighted={highlightModule === 'music'}
        />
        
        {/* Темы */}
        <ThemesCard
          coins={coins}
          hasPurchasedTheme={isPurchased}
          onPurchase={handlePurchase}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </div>

      {/* Тестовые опции (временно) */}
      <div className='bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6'>
        <h3 className='text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2'>
          <span>🧪</span>
          Тестовые опции (для разработки)
        </h3>
        <div className='flex flex-wrap gap-4'>
          <button
            onClick={handleAddCoins}
            className='px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg'
          >
            ➕ Добавить 10000 энергии
          </button>
          <button
            onClick={handleResetCoins}
            className='px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg'
          >
            🔄 Сбросить энергию к 0
          </button>
          <button
            onClick={handleResetPurchases}
            className='px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg'
          >
            🔄 Сбросить все открытые модули
          </button>
        </div>
        <p className='text-sm text-yellow-700 mt-4'>
          ⚠️ Эти опции временные и будут удалены в продакшене
        </p>
      </div>
      
      {/* Модальное окно подтверждения покупки */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title='Подтверждение покупки'
        message={`Вы уверены, что хотите купить эту функцию за ${confirmModal.price} ⚡?`}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />
    </div>
  )
}

