/**
 * Переиспользуемая карточка функции
 * Показывает название, описание, цену и статус покупки
 */
export default function FeatureCard({
  icon,
  title,
  description,
  price,
  isPurchased,
  onPurchase,
  disabled = false,
  hasEnoughCoins = true,
  isHighlighted = false,
  children
}) {
  return (
    <div className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-500 self-start ${
      isHighlighted
        ? 'border-cyan-500 shadow-2xl ring-2 ring-cyan-300'
        : 'border-gray-200'
    }`}>
      {/* Иконка и заголовок */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='text-4xl'>{icon}</div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-600 mt-1'>{description}</p>
          </div>
        </div>
        
        {isPurchased && (
          <div className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
            ✓ Куплено
          </div>
        )}
      </div>

      {/* Дополнительный контент */}
      {children && (
        <div className='mb-4'>
          {children}
        </div>
      )}

      {/* Цена и кнопка покупки */}
      {!isPurchased && (
        <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl font-bold text-cyan-600'>{price}</span>
            <span className='text-yellow-500 text-xl'>⚡</span>
          </div>
          
          <button
            onClick={onPurchase}
            disabled={disabled || !hasEnoughCoins}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              disabled || !hasEnoughCoins
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'
            }`}
          >
            {!hasEnoughCoins ? 'Недостаточно энергии' : 'Купить'}
          </button>
        </div>
      )}
    </div>
  )
}

