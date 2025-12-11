import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import { getCourses } from '../utils/courseStore'
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

  // Все курсы платформы (база + добавленные админом)
  const courseItems = Object.entries(getCourses() || {})
    .map(([key, course]) => ({
      key,
      title: course?.title || getSubjectName(key) || key
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  const hasAccess = (key) => Boolean(full?.access?.[key]?.enabled)

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
        {courseItems.length === 0 ? (
          <div className='col-span-2 text-center py-8 text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90'>
            Курсы ещё не добавлены
          </div>
        ) : (
          courseItems.map((c) => {
            const allowed = hasAccess(c.key)
            return (
              <div key={c.key} className='border border-cyan-200 rounded-2xl p-4 bg-white/90'>
                <div className='font-semibold mb-1'>{c.title}</div>
                <div className={`text-sm mb-3 ${allowed ? 'text-green-700' : 'text-gray-500'}`}>
                  {allowed ? 'Доступ открыт' : 'Доступ закрыт'}
                </div>
                {allowed ? (
                  <Link
                    to={`/courses/${c.key}`}
                    className='inline-block px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition'
                  >
                    Открыть курс
                  </Link>
                ) : (
                  <span className='inline-block px-4 py-2 rounded-xl border border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed'>
                    Нет доступа
                  </span>
                )}
              </div>
            )
          })
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