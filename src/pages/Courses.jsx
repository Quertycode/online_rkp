import { Link } from 'react-router-dom'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import { getUserDirectionsWithSubjects } from '../utils/userHelpers'
import { getSubjectName } from '../constants/subjects'

export default function Courses() {
  const user = getCurrentUser()
  const full = user ? getUserFull(user.username) : null

  if (!user) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Предметы недоступны</h2>
          <p>Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    )
  }

  if (user.role === 'guest') {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Предметы недоступны для гостя</h2>
          <p>Чтобы получить доступ к предметам, оформите доступ или дождитесь активации админом.</p>
        </div>
      </div>
    )
  }

  // Получаем уникальные предметы из направлений пользователя
  const userDirections = getUserDirectionsWithSubjects(user.directions || [])
  const subjectMap = new Map()
  
  userDirections.forEach(dir => {
    if (!subjectMap.has(dir.subjectKey)) {
      subjectMap.set(dir.subjectKey, {
        key: dir.subjectKey,
        title: getSubjectName(dir.subjectKey) || dir.name
      })
    }
  })
  
  const items = Array.from(subjectMap.values())

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Предметы</h1>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {items.length === 0 ? (
          <div className='col-span-2 text-center py-8 text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90'>
            У вас пока нет выбранных предметов
          </div>
        ) : (
          items.map(c => {
            const allowed = full?.access?.[c.key]?.enabled
            return (
              <div key={c.key} className='border border-cyan-200 rounded-2xl p-4 bg-white/90'>
                <div className='font-semibold mb-2'>{c.title}</div>
                <div className='text-sm text-gray-600 mb-3'>
                  {allowed ? 'Доступ открыт' : 'Нет доступа'}
                </div>
                {allowed ? (
                  <Link
                    to={`/courses/${c.key}`}
                    className='inline-block px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition'
                  >
                    Открыть курс
                  </Link>
                ) : (
                  <button
                    disabled
                    className='px-4 py-2 bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed'
                  >
                    Открыть курс
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}