import { useEffect, useState } from 'react'
import { getUsers, initStore, upsertUser } from '../utils/userStore'
import UserForm from '../modules/admin/components/UserForm'
import UsersTable from '../modules/admin/components/UsersTable'
import CourseContentManager from '../modules/admin/components/CourseContentManager'

/**
 * Админ-панель - композиция модульных компонентов
 * Рефакторинг: Разбит на UserForm и UsersTable
 */
export default function AdminPanel() {
  const [users, setUsers] = useState([])

  const reload = () => setUsers(getUsers())

  useEffect(() => {
    initStore()
    reload()
  }, [])

  const handleFormSubmit = (formData) => {
    upsertUser({
      email: formData.email,
      username: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role
    })
    reload()
  }

  return (
    <div className='space-y-6'>
      <UserForm onSubmit={handleFormSubmit} />
      <UsersTable users={users} onUpdate={reload} />
      <CourseContentManager />
    </div>
  )
}
