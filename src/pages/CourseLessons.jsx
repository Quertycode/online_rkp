import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import coursesData from '../data/courses.json'
import LessonCard from '../modules/course/components/LessonCard'
import LessonFilter from '../modules/course/components/LessonFilter'

/**
 * Страница уроков курса - композиция модульных компонентов
 * Рефакторинг: Разбита на LessonCard и LessonFilter
 */
export default function CourseLessons() {
  const { subject } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('active')
  const [progress, setProgress] = useState({})
  
  const user = getCurrentUser()
  // Мемоизируем fullUser, чтобы избежать пересоздания на каждом рендере
  const fullUser = useMemo(() => user ? getUserFull(user.username) : null, [user?.username])

  useEffect(() => {
    if (!user?.username) return
    
    const savedProgress = localStorage.getItem(`progress_${user.username}`)
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress))
      } catch (error) {
        console.error('Error parsing progress:', error)
      }
    }
  }, [user?.username])

  if (!user) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Доступ запрещен</h2>
          <p>Пожалуйста, войдите в систему.</p>
        </div>
      </div>
    )
  }

  if (user.role === 'guest') {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Доступ запрещен</h2>
          <p>Предметы недоступны для гостя.</p>
        </div>
      </div>
    )
  }

  if (!fullUser?.access?.[subject]?.enabled) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Доступ запрещен</h2>
          <p>У вас нет доступа к этому курсу.</p>
        </div>
      </div>
    )
  }

  const course = coursesData[subject]
  if (!course) {
    return (
      <div className="container max-w-[1280px] mx-auto px-6 py-6">
        <div className="border border-cyan-200 rounded-2xl p-6 bg-white/90">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">Ошибка</h2>
          <p>Курс не найден.</p>
        </div>
      </div>
    )
  }

  const getLessonProgress = (lessonId) => {
    const key = `${subject}_${lessonId}`
    return progress[key] || { watched: false, completed: false }
  }

  const filteredLessons = course.lessons.filter(lesson => {
    if (filter === 'all') return true
    const lessonProgress = getLessonProgress(lesson.id)
    return !lessonProgress.watched || !lessonProgress.completed
  })

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{course.title} - Занятия</h1>
        <button
          onClick={() => navigate(`/knowledge-base/${subject}`)}
          className='px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition'
        >
          Материалы по предмету
        </button>
      </div>

      <div className="mb-4">
        <LessonFilter filter={filter} onFilterChange={setFilter} />
      </div>

      <div className='space-y-3'>
        {filteredLessons.map(lesson => {
          const lessonProgress = getLessonProgress(lesson.id)
          
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              subject={subject}
              progress={lessonProgress}
            />
          )
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className='text-center py-8 text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90'>
          {filter === 'active' ? 'Все занятия завершены!' : 'Занятия не найдены.'}
        </div>
      )}
    </div>
  )
}