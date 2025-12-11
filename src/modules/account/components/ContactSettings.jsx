import { useState } from 'react'
import EmailSettingsSection from './EmailSettingsSection'
import PhoneSettingsSection from './PhoneSettingsSection'

/**
 * Контактные настройки: фото профиля и email
 */
export default function ContactSettings({ user }) {
  const [message, setMessage] = useState(null)

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
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

      <EmailSettingsSection user={user} onMessage={showMessage} />
      <PhoneSettingsSection user={user} onMessage={showMessage} />
    </div>
  )
}

