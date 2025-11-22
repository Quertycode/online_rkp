import { useState, useEffect } from 'react'
import { PRICES } from '../../../constants/prices'
import { getAllTracks } from '../../../assets/music/playlist'
import { changeTrack } from '../../../hooks/useMusic'

/**
 * Карточка выбора lo-fi музыки
 * Заменяет функционал MusicSettings из профиля
 * Модуль всегда открыт, но треки нужно покупать отдельно
 */
export default function MusicCard({ coins, hasPurchasedTrack, onPurchase, isHighlighted = false }) {
  const [selectedTrack, setSelectedTrack] = useState(null)
  
  const tracks = getAllTracks()
  
  // Загружаем выбранный трек из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('selectedLofiTrack')
    if (saved) {
      const trackFeature = `track_${saved}`
      // Проверяем, куплен ли сохраненный трек
      if (hasPurchasedTrack(trackFeature)) {
        setSelectedTrack(saved)
      }
    }
  }, [hasPurchasedTrack])
  
  const handleTrackPurchase = (trackId) => {
    const trackFeature = `track_${trackId}`
    // Цена зависит от трека
    let price
    if (trackId === 'lofi-1') {
      price = PRICES.MUSIC_TRACK_LOFI_1
    } else if (trackId === 'lofi-2') {
      price = PRICES.MUSIC_TRACK_LOFI_2
    } else if (trackId === 'lofi-3') {
      price = PRICES.MUSIC_TRACK_LOFI_3
    } else if (trackId === 'lofi-4') {
      price = PRICES.MUSIC_TRACK_LOFI_4
    } else {
      price = PRICES.MUSIC_TRACK_LOFI_2 // По умолчанию
    }
    onPurchase(trackFeature, price)
  }
  
  const handleTrackChange = (trackId) => {
    setSelectedTrack(trackId)
    changeTrack(trackId) // Меняет трек в глобальном Audio объекте
  }
  
  return (
    <div className={`bg-white rounded-xl border p-6 self-start hover:shadow-lg transition-all duration-500 ${
      isHighlighted
        ? 'border-cyan-500 shadow-2xl ring-2 ring-cyan-300'
        : 'border-gray-200'
    }`}>
      {/* Иконка и заголовок */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='text-4xl'>🎵</div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Фоновая музыка</h3>
            <p className='text-sm text-gray-600 mt-1'>Доступ к выбору Lo-Fi треков для фона</p>
          </div>
        </div>
      </div>

      {/* Список треков */}
      <div className='space-y-2'>
        <p className='text-sm font-medium text-gray-700 mb-2'>Выберите трек для фонового воспроизведения:</p>
        {tracks.map((track) => {
          const trackFeature = `track_${track.id}`
          const isOwned = hasPurchasedTrack(trackFeature)
          const isSelected = selectedTrack === track.id
          // Цена зависит от трека
          let trackPrice
          if (track.id === 'lofi-1') {
            trackPrice = PRICES.MUSIC_TRACK_LOFI_1
          } else if (track.id === 'lofi-2') {
            trackPrice = PRICES.MUSIC_TRACK_LOFI_2
          } else if (track.id === 'lofi-3') {
            trackPrice = PRICES.MUSIC_TRACK_LOFI_3
          } else if (track.id === 'lofi-4') {
            trackPrice = PRICES.MUSIC_TRACK_LOFI_4
          } else {
            trackPrice = PRICES.MUSIC_TRACK_LOFI_2 // По умолчанию
          }
          
          return (
            <label
              key={track.id}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected && isOwned
                  ? 'border-cyan-500 bg-cyan-50' 
                  : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                }
                ${!isOwned ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <div className='flex items-center gap-3 flex-1'>
                <input
                  type='radio'
                  name='music-track'
                  value={track.id}
                  checked={isSelected && isOwned}
                  onChange={() => isOwned && handleTrackChange(track.id)}
                  disabled={!isOwned}
                  className='w-4 h-4 text-cyan-500 focus:ring-cyan-400 cursor-pointer disabled:cursor-not-allowed'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-900'>
                      {track.name}
                    </span>
                    {!isOwned && (
                      <span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full'>
                        Заблокировано
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {!isOwned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTrackPurchase(track.id)
                  }}
                  disabled={coins < trackPrice}
                  className={`text-xs px-3 py-1 rounded-lg font-medium ml-2 ${
                    coins >= trackPrice
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {trackPrice} ⚡
                </button>
              )}
              
              {isSelected && isOwned && (
                <div className='flex items-center gap-1 text-cyan-500 ml-2'>
                  <svg className='w-4 h-4 animate-pulse' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' />
                  </svg>
                  <span className='text-xs font-medium'>Выбрано</span>
                </div>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

