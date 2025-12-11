import { getSubjectName } from '../../../constants/subjects'

/**
 * Компонент заголовка профиля
 */
export default function ProfileHeader({ user, fullUser }) {
  const displayName = [fullUser?.firstName || user?.firstName, fullUser?.lastName || user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Пользователь'

  const email = fullUser?.email || user?.email || '—'
  const role = user?.role || 'guest'
  const access = fullUser?.access || user?.access || {}
  const availableCourses = Object.entries(access)
    .filter(([, value]) => Boolean(value?.enabled))
    .map(([code]) => getSubjectName(code))
  const roleLabels = {
    admin: 'Администратор',
    teacher: 'Преподаватель',
    parent: 'Родитель',
    student: 'Ученик',
    guest: 'Гость',
  }

  const getAvatarInitials = () => {
    const first = (fullUser?.firstName || user?.firstName || '').charAt(0).toUpperCase()
    const last = (fullUser?.lastName || user?.lastName || '').charAt(0).toUpperCase()
    return (first + last).trim() || '?'
  }

  const avatar = fullUser?.avatar || user?.avatar || ''

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      {/* Аватар */}
      <div className="relative">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
            {getAvatarInitials()}
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-3 leading-tight">
          <span>{displayName}</span>
          <span className="inline-flex items-center px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-md text-xs font-semibold">
              {roleLabels[role] || role}
          </span>
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 6.75c-1.157-.77-2.5-1.25-4-1.25H5.25A2.25 2.25 0 003 7.75v8A2.25 2.25 0 005.25 18H8c1.5 0 2.843.48 4 1.25"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6.75c1.157-.77 2.5-1.25 4-1.25h2.75A2.25 2.25 0 0121 7.75v8A2.25 2.25 0 0118.75 18H16c-1.5 0-2.843.48-4 1.25"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6.75V19.25"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-600">
              {availableCourses.length ? availableCourses.join(', ') : 'нет открытых курсов'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

