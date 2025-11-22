import { useState, useEffect } from 'react'
import { getAllTracks } from '../../../assets/music/playlist'
import { changeTrack } from '../../../hooks/useMusic'

/**
 * Компонент настроек музыки
 * Позволяет выбрать lo-fi трек из плейлиста
 */
export default function MusicSettings() {
  const tracks = getAllTracks()
  const [selectedTrackId, setSelectedTrackId] = useState('')
  
  // Загружаем выбранный трек при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('selectedLofiTrack') || 'lofi-1'
    setSelectedTrackId(saved)
  }, [])
  
  const handleTrackChange = (trackId) => {
    setSelectedTrackId(trackId)
    changeTrack(trackId)
  }
  
  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center'>
          <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' />
          </svg>
        </div>
        <h2 className='text-xl font-bold text-gray-800'>Фоновая музыка</h2>
      </div>
      
      <p className='text-sm text-gray-600 mb-4'>
        Выберите lo-fi трек для фонового воспроизведения во время учебы
      </p>
      
      <div className='space-y-2'>
        {tracks.map((track) => (
          <label
            key={track.id}
            className={`
              flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedTrackId === track.id 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }
            `}
          >
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name='music-track'
                value={track.id}
                checked={selectedTrackId === track.id}
                onChange={() => handleTrackChange(track.id)}
                className='w-4 h-4 text-purple-500 focus:ring-purple-400'
              />
              <div>
                <p className='font-medium text-gray-800'>{track.name}</p>
                {track.duration && (
                  <p className='text-xs text-gray-500'>{track.duration}</p>
                )}
              </div>
            </div>
            
            {selectedTrackId === track.id && (
              <div className='flex items-center gap-1 text-purple-500'>
                <svg className='w-4 h-4 animate-pulse' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' />
                </svg>
                <span className='text-xs font-medium'>Выбрано</span>
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

