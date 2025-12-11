import { useState } from 'react'
import { upsertUser } from '../../../utils/userStore'

const MAX_SIZE_BYTES = 3 * 1024 * 1024 // 3 MB

/**
 * Загрузка и удаление фото профиля
 */
export default function AvatarUploadSection({ user, onMessage }) {
  const [preview, setPreview] = useState(user?.avatar || '')

  const initials = (() => {
    const first = (user?.firstName || '').charAt(0).toUpperCase()
    const last = (user?.lastName || '').charAt(0).toUpperCase()
    return (first + last).trim() || '?'
  })()

  const showMessage = (type, text) => {
    onMessage?.(type, text)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Выберите файл изображения')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      showMessage('error', 'Размер файла не должен превышать 3 МБ')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result?.toString() || ''
      try {
        upsertUser({ username: user?.username, avatar: dataUrl })
        setPreview(dataUrl)
        showMessage('success', 'Фото обновлено')
      } catch (error) {
        showMessage('error', error.message || 'Не удалось загрузить фото')
      }
    }
    reader.onerror = () => showMessage('error', 'Ошибка чтения файла')
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    try {
      upsertUser({ username: user?.username, avatar: '' })
      setPreview('')
      showMessage('success', 'Фото удалено')
    } catch (error) {
      showMessage('error', error.message || 'Не удалось удалить фото')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Аватар"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
            {initials}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <p className="text-sm text-gray-700">
          Добавьте фото, чтобы персонализировать профиль.
        </p>
        <div className="flex flex-wrap gap-3">
          <label className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            Загрузить фото
          </label>
          {preview && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Удалить
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">Поддерживаются изображения до 3 МБ.</p>
      </div>
    </div>
  )
}


