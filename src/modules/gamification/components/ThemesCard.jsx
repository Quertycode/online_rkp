import FeatureCard from './FeatureCard'
import { PRICES, FEATURES } from '../../../constants/prices'

/**
 * Карточка выбора темы оформления
 */
export default function ThemesCard({ coins, hasPurchasedTheme, onPurchase, currentTheme, onThemeChange }) {
  const themes = [
    {
      id: 'standard',
      name: 'Стандартная',
      description: 'Светлая и чистая',
      icon: '☀️',
      price: 0,
      free: true,
      gradient: 'from-cyan-400 to-blue-400'
    },
    {
      id: FEATURES.THEME_DARK,
      name: 'Темная',
      description: 'Для работы вечером',
      icon: '🌙',
      price: PRICES.THEME_DARK,
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: FEATURES.THEME_PINK,
      name: 'Розовая',
      description: 'Яркая и стильная',
      icon: '🌸',
      price: PRICES.THEME_PINK,
      gradient: 'from-pink-400 to-purple-400'
    }
  ]
  
  const handleThemePurchase = (themeId, price) => {
    onPurchase(themeId, price)
  }
  
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 self-start hover:shadow-lg transition-shadow'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='text-3xl'>🎨</div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Темы оформления</h3>
          <p className='text-sm text-gray-600 mt-1'>Персонализируй интерфейс</p>
        </div>
      </div>

      <div className='space-y-3'>
        {themes.map((theme) => {
          const isOwned = theme.free || hasPurchasedTheme(theme.id)
          const isActive = currentTheme === theme.id
          const hasEnoughCoins = coins >= theme.price
          
          return (
            <div
              key={theme.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? 'border-cyan-500 bg-cyan-50'
                  : isOwned
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200'
              } ${!isOwned ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl`}>
                    {theme.icon}
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-gray-900'>{theme.name}</span>
                      {theme.free && (
                        <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
                          Бесплатно
                        </span>
                      )}
                      {!isOwned && (
                        <span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full'>
                          Заблокировано
                        </span>
                      )}
                      {isActive && (
                        <span className='text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full'>
                          Активна
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-gray-600 mt-1'>{theme.description}</p>
                  </div>
                </div>
                
                {!isOwned && (
                  <div className='text-right'>
                    <div className='flex items-center gap-1 justify-end mb-1'>
                      <span className='text-lg font-bold text-cyan-600'>{theme.price}</span>
                      <span className='text-yellow-500'>⚡</span>
                    </div>
                  </div>
                )}
              </div>
              
              {isOwned ? (
                <button
                  onClick={() => onThemeChange(theme.id)}
                  disabled={isActive}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  {isActive ? 'Текущая тема' : 'Применить'}
                </button>
              ) : (
                <button
                  onClick={() => handleThemePurchase(theme.id, theme.price)}
                  disabled={!hasEnoughCoins}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    hasEnoughCoins
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600 opacity-100'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-100'
                  }`}
                >
                  {hasEnoughCoins ? 'Купить тему' : 'Недостаточно энергии'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

