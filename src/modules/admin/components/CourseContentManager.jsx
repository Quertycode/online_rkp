import { useEffect, useState } from 'react'
import { getCourses, getLessons } from '../../../utils/courseStore'
import CourseSelector from './CourseSelector'
import LessonsEditor from './LessonsEditor'
import TasksEditor from './TasksEditor'

/**
 * Универсальный менеджер контента.
 * Можно зафиксировать курс/занятие через пропсы.
 */
export default function CourseContentManager({
  initialCourse = '',
  lockCourse = false,
  initialLessonId = '',
  showTasks = true
}) {
  const [selectedCourse, setSelectedCourse] = useState(initialCourse || '')
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId || '')
  const [status, setStatus] = useState('')

  const ensureSelection = () => {
    const courses = getCourses()
    const courseId = lockCourse
      ? initialCourse
      : selectedCourse && courses[selectedCourse]
        ? selectedCourse
        : Object.keys(courses)[0] || ''
    const lessons = courseId ? getLessons(courseId) : []
    const currentLesson = lessons.find((l) => String(l.id) === String(selectedLessonId))

    setSelectedCourse(courseId)
    if (!currentLesson) {
      setSelectedLessonId(lessons[0]?.id ? String(lessons[0].id) : '')
    }
  }

  useEffect(() => {
    ensureSelection()
  }, [initialCourse])

  useEffect(() => {
    ensureSelection()
  }, [selectedCourse])

  return (
    <div className='space-y-4'>
      {status && (
        <div className='border border-green-200 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl'>
          {status}
        </div>
      )}

      <CourseSelector
        selectedCourse={selectedCourse}
        onSelectCourse={(id) => {
          setSelectedCourse(id)
          setStatus('')
        }}
        onSaved={(message, courseId) => {
          setStatus(message)
          setSelectedCourse(courseId)
          ensureSelection()
        }}
        disabled={lockCourse}
        lockedCourseId={lockCourse ? initialCourse : ''}
        showCreate={!lockCourse}
      />

      <div className={`grid grid-cols-1 ${showTasks ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4`}>
        <LessonsEditor
          selectedCourse={selectedCourse}
          selectedLessonId={selectedLessonId}
          onSelectLesson={(id) => setSelectedLessonId(id)}
          onSaved={(message, lessonId) => {
            setStatus(message)
            setSelectedLessonId(lessonId)
            ensureSelection()
          }}
        />
        {showTasks && (
          <TasksEditor
            selectedCourse={selectedCourse}
            selectedLessonId={selectedLessonId}
            onSaved={(message) => setStatus(message)}
          />
        )}
      </div>
    </div>
  )
}

