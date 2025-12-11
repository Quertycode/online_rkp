import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import { getUserDirectionsWithSubjects } from '../utils/userHelpers'
import { getSubjectName } from '../constants/subjects'
import OverlayPortal from '../components/OverlayPortal'
import CourseListManager from '../modules/admin/components/CourseListManager'

export default function Courses() {
  const [contentOpen, setContentOpen] = useState(false)
  const user = getCurrentUser()
  const full = user ? getUserFull(user.username) : null

  if (!user) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Курсы недоступны</h2>
          <p>Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    )
  }

  if (user.role === 'guest') {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Курсы недоступны для гостя</h2>
          <p>Чтобы получить доступ к курсам, оформите доступ или дождитесь активации админом.</p>
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
  const allowedItems = items.filter((c) => full?.access?.[c.key]?.enabled)

  // Если доступен ровно один курс с разрешённым доступом — сразу открываем его
  if (allowedItems.length === 1) {
    const only = allowedItems[0]
      return <Navigate to={`/courses/${only.key}`} replace state={{ fromAutoCourse: true }} />
  }

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
      <h1 className="text-2xl font-semibold">Курсы</h1>
        {user.role === 'admin' && (
          <button
            onClick={() => setContentOpen(true)}
            className='px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition'
          >
            Управление контентом
          </button>
        )}
      </div>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {allowedItems.length === 0 ? (
          <div className='col-span-2 text-center py-8 text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90'>
            У вас пока нет доступных курсов
          </div>
        ) : (
          allowedItems.map((c) => (
              <div key={c.key} className='border border-cyan-200 rounded-2xl p-4 bg-white/90'>
                <div className='font-semibold mb-2'>{c.title}</div>
              <div className='text-sm text-gray-600 mb-3'>Доступ открыт</div>
                  <Link
                    to={`/courses/${c.key}`}
                    className='inline-block px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition'
                  >
                    Открыть курс
                  </Link>
              </div>
          ))
        )}
      </div>

      <OverlayPortal open={contentOpen} onClose={() => setContentOpen(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh] border border-cyan-100'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Управление курсами</h3>
              <p className='text-sm text-gray-600'>Список курсов, создание новых, редактирование и удаление.</p>
            </div>
            <button
              type='button'
              onClick={() => setContentOpen(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <CourseListManager />
        </div>
      </OverlayPortal>
    </div>
  )
}