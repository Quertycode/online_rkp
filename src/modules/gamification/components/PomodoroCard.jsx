import { useNavigate } from 'react-router-dom'
import FeatureCard from './FeatureCard'
import { PRICES, FEATURES, FEATURE_DESCRIPTIONS } from '../../../constants/prices'

/**
 * Карточка Pomodoro таймера
 */
export default function PomodoroCard({ coins, isPurchased, onPurchase, isHighlighted = false }) {
  const navigate = useNavigate()
  const feature = FEATURE_DESCRIPTIONS[FEATURES.POMODORO]
  const hasEnoughCoins = coins >= feature.price
  
  const handleAction = () => {
    if (isPurchased) {
      navigate('/pomodoro')
    } else {
      onPurchase(FEATURES.POMODORO, feature.price)
    }
  }
  
  return (
    <FeatureCard
      icon={feature.icon}
      title={feature.name}
      description={feature.description}
      price={feature.price}
      isPurchased={isPurchased}
      onPurchase={handleAction}
      hasEnoughCoins={hasEnoughCoins}
      isHighlighted={isHighlighted}
    >
      {isPurchased && (
        <button
          onClick={() => navigate('/pomodoro')}
          className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all'
        >
          Открыть таймер →
        </button>
      )}
      
      {!isPurchased && (
        <div className='bg-gray-50 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>
            <strong>Техника Pomodoro:</strong>
          </p>
          <ul className='text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc'>
            <li>25 минут работы</li>
            <li>5 минут отдыха</li>
            <li>Повышает концентрацию</li>
            <li>Уведомления о перерывах</li>
          </ul>
        </div>
      )}
    </FeatureCard>
  )
}

