import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCurrentUser, getUserFull, setLastCourse } from '../utils/userStore'
import { COURSE_STORAGE_KEY, getCourse, getCourses, getLessons, getLessonTasks } from '../utils/courseStore'
import LessonCard from '../modules/course/components/LessonCard'
import LessonFilter from '../modules/course/components/LessonFilter'
import OverlayPortal from '../components/OverlayPortal'
import CourseContentManager from '../modules/admin/components/CourseContentManager'

const loadPracticeProgress = (username) => {
  if (!username || typeof localStorage === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(`practice_progress_${username}`)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

/**
 * Страница уроков курса - композиция модульных компонентов
 * Рефакторинг: Разбита на LessonCard и LessonFilter
 */
export default function CourseLessons() {
  const { subject } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [filter] = useState('all')
  const [progress, setProgress] = useState({})
  const [course, setCourse] = useState(() => getCourse(subject))
  const [lessons, setLessons] = useState(() => getLessons(subject))
  const [contentOpen, setContentOpen] = useState(false)
  const [practiceProgress, setPracticeProgress] = useState(() => loadPracticeProgress(user?.username))
  const [coursePickerOpen, setCoursePickerOpen] = useState(false)

  // Мемоизируем fullUser, чтобы избежать пересоздания на каждом рендере
  const fullUser = useMemo(() => user ? getUserFull(user.username) : null, [user?.username])
  const courses = useMemo(() => getCourses(), [])
  const courseOptions = useMemo(() => {
    const access = user?.access || {}
    return Object.entries(access)
      .filter(([, val]) => Boolean(val?.enabled))
      .map(([code]) => ({
        code,
        title: courses[code]?.title || code,
      }))
  }, [user?.access, courses])

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

  useEffect(() => {
    setPracticeProgress(loadPracticeProgress(user?.username))
  }, [user?.username])

  useEffect(() => {
    const reload = () => {
      setCourse(getCourse(subject))
      setLessons(getLessons(subject))
    }
    reload()

    const handleStorage = (e) => {
      if (e.key === COURSE_STORAGE_KEY) {
        reload()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('edumvp_courses_updated', reload)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('edumvp_courses_updated', reload)
    }
  }, [subject])

  // Запоминаем последний выбранный курс
  useEffect(() => {
    if (user?.username && subject) {
      setLastCourse(user.username, subject)
    }
  }, [subject, user?.username])

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
          <p>Курсы недоступны для гостя.</p>
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

  const filteredLessons = lessons

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className='relative'>
            <button
              type='button'
              onClick={() => setCoursePickerOpen((v) => !v)}
              className='text-left text-2xl font-semibold truncate hover:text-cyan-700 transition flex items-center gap-2'
            >
              {course.title}
              <span className={`text-sm transition-transform ${coursePickerOpen ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            {coursePickerOpen && (
              <div className='absolute z-10 mt-2 w-80 bg-white border border-cyan-100 rounded-2xl shadow-lg p-2 space-y-1'>
                {courseOptions.map(({ code, title }) => (
                  <button
                    key={code}
                    type='button'
                    onClick={() => {
                      setCoursePickerOpen(false)
                      if (code !== subject) navigate(`/courses/${code}`, { state: { fromHeader: true } })
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                      code === subject
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                        : 'hover:bg-cyan-50 hover:text-cyan-700 text-gray-800'
                    }`}
                  >
                    {title}
                  </button>
                ))}
                <button
                  type='button'
                  onClick={() => {
                    setCoursePickerOpen(false)
                    navigate('/courses')
                  }}
                  className='w-full text-left px-3 py-2 rounded-xl text-sm transition border border-cyan-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100'
                >
                  ← К списку курсов
                </button>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            {user.role === 'admin' && (
              <button
                onClick={() => setContentOpen(true)}
                className='px-3 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition text-sm'
              >
                Управление контентом
              </button>
            )}
            <button
              onClick={() => navigate(`/knowledge-base/${subject}`)}
              className='px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition text-sm'
            >
              Материалы по предмету
            </button>
          </div>
        </div>
      </div>

      <div className='space-y-3 max-w-4xl mx-auto'>
        {filteredLessons.map(lesson => {
          const lessonProgress = getLessonProgress(lesson.id)
          const tasks = getLessonTasks(subject, lesson.id) || []
          const totalTasks = tasks.length
          const lessonKey = `${subject}_${lesson.id}`
          const lessonCompleted = lessonProgress.completed
          const completedTasks = lessonCompleted
            ? totalTasks
            : tasks.filter((t) => practiceProgress.has(String(t.id))).length
          
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              subject={subject}
              progress={lessonProgress}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
            />
          )
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className='text-center py-8 text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90'>
          Занятия не найдены.
        </div>
      )}

      <OverlayPortal open={contentOpen} onClose={() => setContentOpen(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh] border border-cyan-100'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Управление курсами и занятиями</h3>
              <p className='text-sm text-gray-600'>Создание/редактирование курсов, занятий и практических заданий</p>
            </div>
            <button
              type='button'
              onClick={() => setContentOpen(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <CourseContentManager initialCourse={subject} lockCourse showTasks={false} />
        </div>
      </OverlayPortal>
    </div>
  )
}