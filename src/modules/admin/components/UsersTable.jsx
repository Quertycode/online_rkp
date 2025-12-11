import Card from '../../../components/Card'
import UserRow from './UserRow'

/**
 * Таблица пользователей
 * @param {Array} users - Массив пользователей
 * @param {function} onUpdate - Функция обновления
 */
export default function UsersTable({ users, onUpdate }) {
  return (
    <Card title='Пользователи'>
      <div className='overflow-x-auto -mx-2 md:mx-0'>
        <table className='w-full text-sm min-w-[640px]'>
          <thead>
            <tr className='text-left text-gray-500'>
              <th className='py-2'>Имя</th>
              <th className='py-2'>Фамилия</th>
              <th className='py-2'>Почта</th>
              <th>Роль</th>
              <th>Доступ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.username} user={user} onUpdate={onUpdate} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

