/**
 * Плейлист lo-fi музыки
 * 
 * Как добавить новый трек:
 * 1. Скопируйте файл в папку src/assets/music/
 * 2. Добавьте объект трека в массив lofiPlaylist
 */

export const lofiPlaylist = [
  {
    id: 'lofi-4',
    name: 'Фон для учебы',
    file: 'lofi-track-4.mp3',
    // duration: '3:45' // Необязательно, для отображения
  },
  {
    id: 'lofi-1',
    name: 'Фон для идей',
    file: 'lofi-track-1.mp3',
    // duration: '3:45'
  },
  {
    id: 'lofi-2',
    name: 'Ночная лампа',
    file: 'lofi-track-2.mp3',
   // duration: '4:20'
  },
  {
    id: 'lofi-3',
    name: 'Продуктивный день',
    file: 'lofi-track-3.mp3',
   // duration: '3:15'
  },
]

/**
 * Получить полный путь к треку
 */
export function getTrackPath(filename) {
  return `/src/assets/music/${filename}`
}

/**
 * Получить трек по ID
 */
export function getTrackById(id) {
  return lofiPlaylist.find(track => track.id === id) || lofiPlaylist[0]
}

/**
 * Получить все треки
 */
export function getAllTracks() {
  return lofiPlaylist
}


