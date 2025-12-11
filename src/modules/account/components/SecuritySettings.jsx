import { useState } from 'react'
import { updateUserCredentials } from '../../../utils/userStore'

/**
 * Компонент настроек безопасности (смена пароля)
 */
export default function SecuritySettings({ user }) {
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handlePasswordSave = () => {
    if (!newPassword.trim()) {
      showMessage('error', 'Введите новый пароль')
      return
    }
    if (newPassword.trim().length < 6) {
      showMessage('error', 'Пароль должен быть не короче 6 символов')
      return
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      showMessage('error', 'Пароли не совпадают')
      return
    }
    try {
      updateUserCredentials(user?.username, { password: newPassword.trim() })
      showMessage('success', 'Пароль обновлен')
      setIsEditingPassword(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showMessage('error', error.message || 'Не удалось обновить пароль')
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Пароль
        </label>
        {isEditingPassword ? (
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Новый пароль"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Подтвердите пароль"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordSave}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsEditingPassword(false)
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">••••••••</span>
            <button
              onClick={() => setIsEditingPassword(true)}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              Изменить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

