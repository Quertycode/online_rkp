import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import { getSubjectName } from '../constants/subjects'
import ProfileHeader from '../modules/account/components/ProfileHeader'
import GamificationStats from '../modules/account/components/GamificationStats'

/**
 * Главная страница - композиция модулей
 * Рефакторинг: Разбита на модульные компоненты для лучшей поддерживаемости
 */
export default function Home() {
  const user = getCurrentUser()
  const fullUser = user?.username ? getUserFull(user.username) : null
  const availableCourses = Object.entries(user?.access || {})
    .filter(([, value]) => Boolean(value?.enabled))
    .map(([code]) => ({ code, name: getSubjectName(code) }))
  const singleCourse = availableCourses.length === 1 ? availableCourses[0] : null
  const targetCoursePath = singleCourse ? `/courses/${singleCourse.code}` : '/courses'
  const ctaRef = useRef(null)

  useEffect(() => {
    let frame = 0
    const handleMove = (event) => {
      if (!ctaRef.current) return
      const rect = ctaRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      const clampedX = Math.max(-0.2, Math.min(1.2, x || 0.5))
      const clampedY = Math.max(-0.2, Math.min(1.2, y || 0.5))
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ctaRef.current?.style.setProperty('--mx', `${clampedX * 100}%`)
        ctaRef.current?.style.setProperty('--my', `${clampedY * 100}%`)
      })
    }

    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-8 animate-fade">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-10" />
        <div className="relative z-10">
          {user ? (
            <ProfileHeader user={user} fullUser={fullUser} />
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                ?
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Гость</h1>
                <p className="text-gray-600">Войдите, чтобы увидеть профиль и курсы</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Статистика</h2>
        <GamificationStats />
      </section>

      <div
        ref={ctaRef}
        className="course-cta relative overflow-hidden rounded-2xl text-white px-6 py-6 sm:px-8 shadow-lg"
      >
        <div className="absolute inset-0 bg-white/5" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
              Учебные курсы
            </p>
            <h3 className="text-2xl font-bold leading-tight">
              {availableCourses.length === 1
                ? `Перейти к курсу “${singleCourse?.name}”`
                : 'Перейти к курсам'}
            </h3>
            <p className="text-sm text-white/80">
              {availableCourses.length > 1
                ? `Доступно ${availableCourses.length} курса`
                : 'Откройте материалы в один клик'}
            </p>
          </div>
          <Link
            to={targetCoursePath}
            className="course-cta__action inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Открыть
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
