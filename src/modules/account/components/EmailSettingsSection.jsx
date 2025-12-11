import { useState } from 'react'
import { updateUserCredentials } from '../../../utils/userStore'

/**
 * Редактирование email пользователя
 */
export default function EmailSettingsSection({ user, onMessage }) {
  const [isEditing, setIsEditing] = useState(false)
  const [newEmail, setNewEmail] = useState(user?.email || '')

  const showMessage = (type, text) => {
    onMessage?.(type, text)
  }

  const handleSave = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showMessage('error', 'Введите корректный адрес электронной почты')
      return
    }
    try {
      updateUserCredentials(user?.username, { email: newEmail.trim() })
      showMessage('success', 'Email обновлен')
      setIsEditing(false)
    } catch (error) {
      showMessage('error', error.message || 'Не удалось обновить email')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Электронная почта
      </label>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="email@example.com"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setNewEmail(user?.email || '')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-900">{user?.email || '—'}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            Изменить
          </button>
        </div>
      )}
    </div>
  )
}


