import { useState } from 'react'
import { updateUserCredentials } from '../../../utils/userStore'

/**
 * Редактирование номера телефона пользователя
 */
export default function PhoneSettingsSection({ user, onMessage }) {
  const [isEditing, setIsEditing] = useState(false)
  const [newPhone, setNewPhone] = useState(user?.phone || '')

  const showMessage = (type, text) => {
    onMessage?.(type, text)
  }

  const handleSave = () => {
    const phone = newPhone.trim()
    if (!phone || phone.length < 6) {
      showMessage('error', 'Введите корректный номер телефона')
      return
    }
    try {
      updateUserCredentials(user?.username, { phone })
      showMessage('success', 'Телефон обновлен')
      setIsEditing(false)
    } catch (error) {
      showMessage('error', error.message || 'Не удалось обновить телефон')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Номер телефона
      </label>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="+7 (___) ___-__-__"
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
                setNewPhone(user?.phone || '')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-900">{user?.phone || '—'}</span>
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


