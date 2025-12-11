import { useMemo, useState } from 'react'
import { upsertUser, updateUserCredentials } from '../../../utils/userStore'

const TIMEOUT = 3500

export default function useProfileSettings(user = {}, fullUser = {}) {
  const baseEmail = fullUser?.email || user?.email || ''
  const baseAvatar = fullUser?.avatar || user?.avatar || ''
  
  const [avatarPreview, setAvatarPreview] = useState(baseAvatar)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newEmail, setNewEmail] = useState(baseEmail)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formMessage, setFormMessage] = useState(null)
  
  const displayName = useMemo(() => {
    const first = fullUser?.firstName || user?.firstName || ''
    const last = fullUser?.lastName || user?.lastName || ''
    return [first, last].filter(Boolean).join(' ').trim() || '—'
  }, [fullUser, user])
  
  const username = user?.username || ''
  const role = user?.role || 'guest'
  const email = baseEmail || '—'

  const getAvatarInitials = () => {
    const first = (fullUser?.firstName || user?.firstName || '').charAt(0).toUpperCase()
    const last = (fullUser?.lastName || user?.lastName || '').charAt(0).toUpperCase()
    return (first + last).trim() || '?'
  }

  const showMessage = (type, text) => {
    if (type === null) {
      setFormMessage(null)
      return
    }
    setFormMessage({ type, text })
    setTimeout(() => setFormMessage(null), TIMEOUT)
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Пожалуйста, выберите изображение')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setAvatarPreview(base64String)
      if (fullUser) {
        upsertUser({ ...fullUser, avatar: base64String })
        window.location.reload()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarRemove = () => {
    setAvatarPreview('')
    if (fullUser) {
      upsertUser({ ...fullUser, avatar: '' })
      window.location.reload()
    }
  }

  const handleEmailSave = () => {
    if (!newEmail.trim()) {
      showMessage('error', 'Введите новую почту')
      return
    }
    try {
      updateUserCredentials(user?.username, { email: newEmail.trim() })
      showMessage('success', 'Почта обновлена')
      setIsEditingEmail(false)
    } catch (error) {
      showMessage('error', error.message || 'Не удалось обновить почту')
    }
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

  return {
    avatarPreview,
    confirmPassword,
    displayName,
    email,
    formMessage,
    getAvatarInitials,
    handleAvatarRemove,
    handleAvatarUpload,
    handleEmailSave,
    handlePasswordSave,
    isEditingEmail,
    isEditingPassword,
    newEmail,
    newPassword,
    role,
    setConfirmPassword,
    setFormMessage,
    setIsEditingEmail,
    setIsEditingPassword,
    setNewEmail,
    setNewPassword,
    showMessage,
    username,
  }
}