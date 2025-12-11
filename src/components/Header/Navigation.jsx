import { NavLink } from 'react-router-dom'
import { getCurrentUser } from '../../utils/userStore'

const linkBase =
  'text-gray-800 font-medium py-2 px-2 md:px-4 text-sm md:text-base whitespace-nowrap border-b-2 border-transparent hover:border-cyan-500 transition-all duration-200'

const activeLinkBase =
  'text-cyan-500 font-medium py-2 px-2 md:px-4 text-sm md:text-base whitespace-nowrap border-b-2 border-cyan-500 transition-all duration-200'

/**
 * Навигационное меню
 */
export default function Navigation() {
  const user = getCurrentUser()

  return (
    <nav className='w-full md:w-auto flex gap-1 md:gap-2 items-center md:items-start order-3 md:order-3 overflow-x-auto pb-2 md:pb-0'>
      <NavLink
        to='/courses'
        state={{ fromHeader: true }}
        className={({ isActive }) => (isActive ? activeLinkBase : linkBase)}
      >
        Курс
      </NavLink>
      <NavLink
        to='/practice'
        state={{ fromHeader: true }}
        className={({ isActive }) => (isActive ? activeLinkBase : linkBase)}
      >
        Практика
      </NavLink>
      {user?.role === 'teacher' && (
        <NavLink
          to='/teacher-panel'
          state={{ fromHeader: true }}
          className={({ isActive }) => (isActive ? activeLinkBase : linkBase)}
        >
          Преподаватель
        </NavLink>
      )}
      {user?.role === 'admin' && (
        <NavLink
          to='/admin'
          state={{ fromHeader: true }}
          className={({ isActive }) => (isActive ? activeLinkBase : linkBase)}
        >
          Админ
        </NavLink>
      )}
    </nav>
  )
}

