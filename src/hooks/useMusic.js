import { useState, useEffect } from 'react'
import { getCurrentUser } from '../utils/userStore'
import { hasPurchased } from '../utils/gamificationStore'
import { getTrackById, getTrackPath, getAllTracks } from '../assets/music/playlist'

// Глобальный аудио объект (единственный экземпляр для всего приложения)
let globalAudio = null
let currentTrackId = null

// Ключ для хранения выбранного трека в localStorage
const SELECTED_TRACK_KEY = 'selectedLofiTrack'
const MUSIC_POSITION_KEY = 'musicPosition'
const MUSIC_IS_PLAYING_KEY = 'musicIsPlaying'

/**
 * Хук для управления lo-fi музыкой
 * Использует глобальный Audio объект, чтобы музыка не прерывалась при переключении страниц
 */
export function useMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  // Проверяем, куплен ли хотя бы один трек
  useEffect(() => {
    const checkUnlocked = () => {
      const user = getCurrentUser()
      if (user?.username) {
        const tracks = getAllTracks()
        // Проверяем, куплен ли хотя бы один трек
        const hasAnyTrack = tracks.some(track => {
          const trackFeature = `track_${track.id}`
          return hasPurchased(user.username, trackFeature)
        })
        
        setIsUnlocked(hasAnyTrack)
        
        // Если нет купленных треков, останавливаем музыку
        if (!hasAnyTrack && globalAudio && !globalAudio.paused) {
          globalAudio.pause()
          setIsPlaying(false)
        }
      }
    }
    
    // Проверяем сразу
    checkUnlocked()
    
    // Слушаем изменения в localStorage (для обновления после покупки)
    const handleStorageChange = (e) => {
      if (e.key === 'edumvp_purchases') {
        checkUnlocked()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Также проверяем периодически (на случай, если покупка была в той же вкладке)
    const interval = setInterval(checkUnlocked, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  
  // Загружаем выбранный трек из localStorage
  const getSelectedTrackId = () => {
    return localStorage.getItem(SELECTED_TRACK_KEY)
  }
  
  // Инициализируем Audio объект только один раз
  useEffect(() => {
    if (!globalAudio) {
      const trackId = getSelectedTrackId()
      
      // Если есть выбранный трек, загружаем его
      if (trackId) {
        const track = getTrackById(trackId)
        currentTrackId = trackId
        
        try {
          globalAudio = new Audio(getTrackPath(track.file))
          setCurrentTrack(track)
        } catch (error) {
          console.error('Ошибка загрузки музыкального файла:', error)
          globalAudio = new Audio()
        }
      } else {
        // Если нет выбранного трека, создаем пустой Audio объект
        globalAudio = new Audio()
      }
      
      globalAudio.loop = true
      globalAudio.volume = 0.3 // 30% громкости для фоновой музыки
      
      // Восстанавливаем позицию воспроизведения из localStorage
      const savedPosition = localStorage.getItem(MUSIC_POSITION_KEY)
      const savedIsPlaying = localStorage.getItem(MUSIC_IS_PLAYING_KEY) === 'true'
      
      if (savedPosition && !isNaN(parseFloat(savedPosition))) {
        globalAudio.currentTime = parseFloat(savedPosition)
      }
      
      // Обработчики событий
      globalAudio.addEventListener('playing', () => {
        setIsPlaying(true)
        setIsLoading(false)
        localStorage.setItem(MUSIC_IS_PLAYING_KEY, 'true')
      })
      
      globalAudio.addEventListener('pause', () => {
        setIsPlaying(false)
        setIsLoading(false)
        localStorage.setItem(MUSIC_IS_PLAYING_KEY, 'false')
        // Сохраняем позицию при паузе
        if (globalAudio.currentTime) {
          localStorage.setItem(MUSIC_POSITION_KEY, globalAudio.currentTime.toString())
        }
      })
      
      globalAudio.addEventListener('timeupdate', () => {
        // Сохраняем позицию каждую секунду во время воспроизведения
        if (!globalAudio.paused && globalAudio.currentTime) {
          localStorage.setItem(MUSIC_POSITION_KEY, globalAudio.currentTime.toString())
        }
      })
      
      globalAudio.addEventListener('waiting', () => {
        setIsLoading(true)
      })
      
      globalAudio.addEventListener('canplay', () => {
        setIsLoading(false)
        // Если музыка должна играть, запускаем воспроизведение
        if (savedIsPlaying) {
          globalAudio.play().catch(console.error)
        }
      })
      
      globalAudio.addEventListener('ended', () => {
        // При окончании трека (если loop отключен) сбрасываем позицию
        localStorage.setItem(MUSIC_POSITION_KEY, '0')
      })
    } else {
      // Синхронизируем состояние с текущим состоянием Audio
      setIsPlaying(!globalAudio.paused)
      if (currentTrackId) {
        const track = getTrackById(currentTrackId)
        setCurrentTrack(track)
      }
      
      // Восстанавливаем позицию и состояние воспроизведения
      const savedPosition = localStorage.getItem(MUSIC_POSITION_KEY)
      const savedIsPlaying = localStorage.getItem(MUSIC_IS_PLAYING_KEY) === 'true'
      
      if (savedPosition && !isNaN(parseFloat(savedPosition)) && globalAudio.readyState >= 2) {
        globalAudio.currentTime = parseFloat(savedPosition)
      }
      
      if (savedIsPlaying && globalAudio.paused && globalAudio.readyState >= 2) {
        globalAudio.play().catch(console.error)
      }
    }
    
    return () => {
      // НЕ удаляем Audio при размонтировании компонента,
      // чтобы музыка продолжала играть при переключении страниц
    }
  }, [])
  
  const togglePlay = async () => {
    if (!globalAudio) return
    
    // Проверяем, куплен ли хотя бы один трек
    const user = getCurrentUser()
    if (!user?.username) return
    
    const tracks = getAllTracks()
    const hasAnyTrack = tracks.some(track => {
      const trackFeature = `track_${track.id}`
      return hasPurchased(user.username, trackFeature)
    })
    
    if (!hasAnyTrack) {
      alert('⚠️ Сначала нужно купить хотя бы один трек в разделе Геймификации!')
      return
    }
    
    // Проверяем, что выбранный трек куплен
    const selectedTrackId = localStorage.getItem(SELECTED_TRACK_KEY)
    if (selectedTrackId) {
      const trackFeature = `track_${selectedTrackId}`
      if (!hasPurchased(user.username, trackFeature)) {
        alert('⚠️ Выбранный трек не куплен! Выберите купленный трек в Геймификации.')
        return
      }
    }
    
    try {
      if (globalAudio.paused) {
        setIsLoading(true)
        await globalAudio.play()
      } else {
        globalAudio.pause()
      }
    } catch (error) {
      console.error('Ошибка воспроизведения музыки:', error)
      setIsLoading(false)
    }
  }
  
  return {
    isPlaying,
    isLoading,
    currentTrack,
    isUnlocked,
    togglePlay
  }
}

/**
 * Функция для смены трека (вызывается из геймификации)
 * @param {string} trackId - ID трека из плейлиста
 */
export function changeTrack(trackId) {
  if (!globalAudio) return
  
  // Проверяем, что трек куплен
  const user = getCurrentUser()
  if (user?.username) {
    const trackFeature = `track_${trackId}`
    if (!hasPurchased(user.username, trackFeature)) {
      console.warn('Попытка выбрать некупленный трек:', trackId)
      return
    }
  }
  
  const track = getTrackById(trackId)
  const wasPlaying = !globalAudio.paused
  
  // Сохраняем выбор в localStorage
  localStorage.setItem(SELECTED_TRACK_KEY, trackId)
  currentTrackId = trackId
  
  // Меняем источник аудио
  globalAudio.src = getTrackPath(track.file)
  
  // Сбрасываем сохраненную позицию при смене трека
  localStorage.setItem(MUSIC_POSITION_KEY, '0')
  
  // Если музыка играла, продолжаем воспроизведение
  if (wasPlaying) {
    globalAudio.play().catch(console.error)
  }
}
