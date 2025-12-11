import { useGamification } from '../../../hooks/useGamification'

/**
 * Компонент статистики геймификации
 * Показывает время обучения и streak
 */
export default function GamificationStats() {
  const { timeSeconds, streak, longestStreak, hasUser } = useGamification()

  const totalMinutes = Math.max(0, Math.round((timeSeconds || 0) / 60))
  const hours = Math.floor((timeSeconds || 0) / 3600)
  const minutes = Math.floor(((timeSeconds || 0) % 3600) / 60)
  const formattedTime =
    hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`

  if (!hasUser) {
    return (
      <div className="text-center py-8 text-gray-500">
        Войдите в систему, чтобы увидеть статистику
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Время в курсах и практических заданиях */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-800">
            Время в учебе
          </span>
          <span className="text-2xl">⏰</span>
        </div>
        <div className="text-3xl font-bold text-cyan-900">{formattedTime}</div>
        <div className="text-xs text-cyan-700 mt-1">
          общее время в занятиях и практических заданиях
        </div>
      </div>

      {/* Текущая серия */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-orange-800">
            Серия дней
          </span>
          <span className="text-2xl">🔥</span>
        </div>
        <div className="text-3xl font-bold text-orange-900">{streak}</div>
        <div className="text-xs text-orange-700 mt-1">дней подряд</div>
      </div>

      {/* Лучшая серия */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-800">
            Лучшая серия
          </span>
          <span className="text-2xl">⭐</span>
        </div>
        <div className="text-3xl font-bold text-purple-900">{longestStreak}</div>
        <div className="text-xs text-purple-700 mt-1">дней</div>
      </div>
    </div>
  )
}

