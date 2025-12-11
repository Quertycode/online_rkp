import useProfileSettings from '../hooks/useProfileSettings'
import ProfileHero from './ProfileHero'
import ProfileInfo from './ProfileInfo'
import SecuritySettings from './SecuritySettings'
import AccountActions from './AccountActions'

/**
 * Карточка профиля пользователя (модульная композиция)
 */
export default function ProfileCard({ user, fullUser, onLogout }) {
  const settings = useProfileSettings(user, fullUser)

  return (
    <div className='space-y-6'>
      {/* Сообщения */}
      {settings.formMessage && (
        <div
          className={`rounded-xl px-5 py-4 text-sm font-semibold animate-fade flex items-center gap-3 ${
            settings.formMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-2 border-rose-200'
          }`}
        >
          {settings.formMessage.type === 'success' ? (
            <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          ) : (
            <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          )}
          {settings.formMessage.text}
        </div>
      )}

      {/* Хедер профиля */}
      <ProfileHero
        avatarPreview={settings.avatarPreview}
        displayName={settings.displayName}
        email={settings.email}
        username={settings.username}
        role={settings.role}
        getAvatarInitials={settings.getAvatarInitials}
        handleAvatarUpload={settings.handleAvatarUpload}
        handleAvatarRemove={settings.handleAvatarRemove}
      />

      {/* Сетка с секциями */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Основная информация */}
        <ProfileInfo
          email={settings.email}
          isEditingEmail={settings.isEditingEmail}
          newEmail={settings.newEmail}
          setNewEmail={settings.setNewEmail}
          setIsEditingEmail={settings.setIsEditingEmail}
          handleEmailSave={settings.handleEmailSave}
          setFormMessage={settings.showMessage}
        />

        {/* Безопасность */}
        <SecuritySettings
          isEditingPassword={settings.isEditingPassword}
          newPassword={settings.newPassword}
          confirmPassword={settings.confirmPassword}
          setNewPassword={settings.setNewPassword}
          setConfirmPassword={settings.setConfirmPassword}
          setIsEditingPassword={settings.setIsEditingPassword}
          handlePasswordSave={settings.handlePasswordSave}
          setFormMessage={settings.showMessage}
        />
      </div>

      {/* Действия с аккаунтом */}
      <AccountActions onLogout={onLogout} />
    </div>
  )
}
