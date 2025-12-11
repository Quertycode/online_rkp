import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import Card from '../components/Card'
import OverlayPortal from '../components/OverlayPortal'
import CourseContentManager from '../modules/admin/components/CourseContentManager'
import { COURSE_STORAGE_KEY, getCourse, getLesson, getLessonTasks } from '../utils/courseStore'
import { useLessonProgress } from '../modules/lesson/hooks/useLessonProgress'
import LessonHeader from '../modules/lesson/components/LessonHeader'
import LessonTabs from '../modules/lesson/components/LessonTabs'
import VideoTab from '../modules/lesson/components/VideoTab'
import HomeworkTab from '../modules/lesson/components/HomeworkTab'
import MaterialsTab from '../modules/lesson/components/MaterialsTab'

/**
 * Страница деталей урока - композиция модульных компонентов
 * Рефакторинг: Разбит на модульные компоненты
 */
export default function LessonDetails() {
  const { subject, lessonId } = useParams()
  const user = getCurrentUser()
  const fullUser = user ? getUserFull(user.username) : null
  const [activeTab, setActiveTab] = useState('video')
  const [course, setCourse] = useState(() => getCourse(subject))
  const [lesson, setLesson] = useState(() => getLesson(subject, lessonId))
  const [homeworkTasks, setHomeworkTasks] = useState(() =>
    getLessonTasks(subject, lessonId)
  )
  const [contentOpen, setContentOpen] = useState(false)
  
  const { markAsWatched, handleHomeworkSubmit, getTaskAnswer } = useLessonProgress(subject, lessonId)

  // Проверка доступа
  if (!user) {
    return <Card title='Доступ запрещен'>Пожалуйста, войдите в систему.</Card>
  }

  if (user.role === 'guest') {
    return <Card title='Доступ запрещен'>Предметы недоступны для гостя.</Card>
  }

  if (!fullUser?.access?.[subject]?.enabled) {
    return <Card title='Доступ запрещен'>У вас нет доступа к этому курсу.</Card>
  }

  // Получение данных
  if (!course) {
    return <Card title='Ошибка'>Курс не найден.</Card>
  }

  if (!lesson) {
    return <Card title='Ошибка'>Занятие не найдено.</Card>
  }

  useEffect(() => {
    const reload = () => {
      setCourse(getCourse(subject))
      setLesson(getLesson(subject, lessonId))
      setHomeworkTasks(getLessonTasks(subject, lessonId))
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
  }, [subject, lessonId])

  return (
    <div className='space-y-4'>
      <LessonHeader lesson={lesson} subject={subject}>
        <div className='flex flex-col gap-4'>
          <div className='flex items-start justify-between gap-4 flex-wrap'>
            <div className='space-y-3'>
              <Link
                to={`/courses/${subject}`}
                className='inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors'
                title={`Назад к занятиям курса ${course.title}`}
              >
                <span className='text-lg leading-none'>←</span>
                <span>{course.title}</span>
              </Link>
              <div className='flex items-center gap-3 flex-wrap'>
                <span className='px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-sm font-semibold'>
                  Занятие {lesson.order || lesson.id}
                </span>
                <h1 className='text-2xl font-semibold text-gray-900'>{lesson.title}</h1>
                {user.role === 'admin' && (
                  <button
                    type='button'
                    onClick={() => setContentOpen(true)}
                    className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition text-sm'
                  >
                    Управление контентом
                  </button>
                )}
              </div>
              <p className='text-sm text-gray-700'>
                Преподаватель:{' '}
                <span className='font-medium'>
                  {lesson.teacherName || lesson.teacher || 'не назначен'}
                </span>
              </p>
              <div className='space-y-1'>
                <div className='border border-cyan-100 bg-cyan-50/60 rounded-xl p-4 space-y-2'>
                  <p className='text-sm font-semibold text-gray-800'>Цель курса:</p>
                  <p className='text-gray-700'>
                    {lesson.description || 'Описание занятия скоро появится.'}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex-shrink-0'>
        <LessonTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

        {activeTab === 'video' && (
          <VideoTab lesson={lesson} onMarkAsWatched={markAsWatched} />
        )}

        {activeTab === 'homework' && (
          <HomeworkTab 
            tasks={homeworkTasks}
            getTaskAnswer={getTaskAnswer}
            handleSubmit={handleHomeworkSubmit}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab materials={lesson.materials} />
        )}
        </div>
      </LessonHeader>

      <OverlayPortal open={contentOpen} onClose={() => setContentOpen(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh] border border-cyan-100'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Управление занятием</h3>
              <p className='text-sm text-gray-600'>Редактируйте это занятие и задания к нему.</p>
            </div>
            <button
              type='button'
              onClick={() => setContentOpen(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <CourseContentManager initialCourse={subject} initialLessonId={lessonId} lockCourse showTasks={true} />
        </div>
      </OverlayPortal>
    </div>
  )
}