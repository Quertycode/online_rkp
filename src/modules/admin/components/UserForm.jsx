import Card from '../../../components/Card'
import { useState } from 'react'

const emptyForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'guest'
}

/**
 * Форма создания/редактирования пользователя
 * @param {function} onSubmit - Функция отправки формы
 */
export default function UserForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) return
    onSubmit(form)
    setForm(emptyForm)
  }

  return (
    <Card title='Создание / обновление пользователя'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder='Электронная почта'
            className='border border-cyan-300 rounded-lg px-3 py-2'
            type='email'
            required
          />
          <input
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder='Пароль'
            className='border border-cyan-300 rounded-lg px-3 py-2'
            type='password'
            required
          />
          <input
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            placeholder='Имя'
            className='border border-cyan-300 rounded-lg px-3 py-2'
            type='text'
          />
          <input
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            placeholder='Фамилия'
            className='border border-cyan-300 rounded-lg px-3 py-2'
            type='text'
          />
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className='border border-cyan-300 rounded-lg px-3 py-2'
          >
            <option value='guest'>guest</option>
            <option value='student'>student</option>
            <option value='admin'>admin</option>
          </select>
        </div>
        <div className='mt-3'>
          <button
            type='submit'
            className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition'
          >
            Сохранить
          </button>
        </div>
      </form>
    </Card>
  )
}

