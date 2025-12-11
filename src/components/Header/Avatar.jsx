/**
 * Компонент для отображения аватара пользователя
 * @param {string} firstName - Имя пользователя
 * @param {string} lastName - Фамилия пользователя
 * @param {string} avatar - URL аватара
 * @param {string} username - Username пользователя
 * @param {string} size - Размер аватара (Tailwind класс)
 */
export default function Avatar({ firstName = '', lastName = '', avatar = '', username = '', size = 'w-9 h-9' }) {
  const getAvatarInitials = (firstName, lastName, username = '') => {
    if (firstName && lastName) {
      const first = firstName.charAt(0).toUpperCase()
      const last = lastName.charAt(0).toUpperCase()
      return first + last
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    if (username) {
      return username.charAt(0).toUpperCase()
    }
    return '?'
  }

  const initials = getAvatarInitials(firstName, lastName, username)
  
  if (avatar) {
    return <img src={avatar} alt={`${firstName} ${lastName}`} className={`${size} rounded-full object-cover`} />
  }
  
  return (
    <div className={`${size} rounded-full bg-cyan-500 text-white flex items-center justify-center font-semibold text-base`}>
      {initials}
    </div>
  )
}

