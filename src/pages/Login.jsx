import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { getCurrentUser, initStore, login, register } from '../utils/userStore'

export default function Login() {
  const [isReg, setIsReg] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    initStore()
  }, [])

  useEffect(() => {
    const user = getCurrentUser()
    if (user) navigate('/')
  }, [navigate])

  const submit = (event) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    try {
      if (isReg) {
        register(
          normalizedEmail,
          password.trim(),
          firstName.trim(),
          lastName.trim(),
          birthdate.trim(),
          phone.trim()
        )
      } else {
        login(normalizedEmail, password.trim())
      }
      
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка')
    }
  }

  const toggleMode = () => {
    setIsReg(!isReg)
    setError('')
    if (isReg) {
      setFirstName('')
      setLastName('')
      setBirthdate('')
      setPhone('')
    }
  }

  return (
    <div className={`mx-auto w-full px-4 md:px-0 ${isReg ? 'max-w-2xl' : 'max-w-md'}`}>
      <Card title=''>
        <h2 className='text-xl font-bold text-center text-cyan-700 mb-3'>
          {isReg ? 'Регистрация' : 'Вход'}
        </h2>
        <form onSubmit={submit} className='space-y-4'>
          {isReg && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <input
                  type='text'
                  placeholder='Имя'
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
                  required
                />
                <input
                  type='text'
                  placeholder='Фамилия'
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
                  required
                />
              </div>
              <div>
                <label className='block text-sm text-gray-700 mb-1'>Дата рождения</label>
                <input
                  type='date'
                  placeholder='Дата рождения'
                  value={birthdate}
                  onChange={(event) => setBirthdate(event.target.value)}
                  className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
                  required
                />
              </div>
              <div>
                <label className='block text-sm text-gray-700 mb-1'>Номер телефона</label>
                <input
                  type='tel'
                  placeholder='+7 (___) ___-__-__'
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
                  required
                />
              </div>
            </>
          )}
          <input
            type='email'
            placeholder='Электронная почта'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
            required
          />
          <input
            type='password'
            placeholder='Пароль'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className='w-full border border-cyan-300 rounded-lg px-3 py-2 text-sm'
            required
          />
          {error && <div className='text-rose-600 text-sm bg-rose-50 px-3 py-2 rounded-lg'>{error}</div>}
          <button
            type='submit'
            className='w-full px-4 py-2.5 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition'
          >
            {isReg ? 'Зарегистрироваться' : 'Войти'}
          </button>
          <button
            type='button'
            onClick={toggleMode}
            className='w-full px-4 py-2.5 rounded-xl border border-cyan-300 hover:bg-cyan-50 transition font-medium'
          >
            {isReg ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
          {!isReg && (
            <div className='text-xs text-gray-500 text-center'>
              Подсказка: тестовые данные — <b>admin@example.com / admin</b>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}
