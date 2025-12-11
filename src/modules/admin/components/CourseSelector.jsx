import { useEffect, useState } from 'react'
import { getCourses, upsertCourse } from '../../../utils/courseStore'

export default function CourseSelector({
  selectedCourse,
  onSelectCourse,
  onSaved,
  disabled = false,
  lockedCourseId = '',
  showCreate = true
}) {
  const [courses, setCourses] = useState({})
  const [form, setForm] = useState({ id: '', title: '' })

  const loadCourses = () => setCourses(getCourses())

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    loadCourses()
  }, [lockedCourseId])

  const handleSave = () => {
    if (!form.id.trim()) return
    const id = form.id.trim()
    const title = form.title.trim() || id
    upsertCourse({ id, title, lessons: getCourses()[id]?.lessons || [] })
    setForm({ id: '', title: '' })
    loadCourses()
    onSaved?.('Курс сохранен', id)
  }

  const lockedTitle = lockedCourseId ? courses[lockedCourseId]?.title || lockedCourseId : null

  if (disabled && lockedCourseId) {
    return (
      <div className='border border-cyan-200 rounded-xl p-4 bg-white/90 space-y-2'>
        <p className='text-sm text-cyan-700/70'>Курс</p>
        <div className='text-lg font-semibold text-gray-900'>{lockedTitle}</div>
      </div>
    )
  }

  return (
    <div className='border border-cyan-200 rounded-xl p-4 bg-white/90 space-y-3'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <p className='text-sm text-cyan-700/70'>Курсы</p>
          <h3 className='text-lg font-semibold text-gray-900'>Создание и выбор курса</h3>
        </div>
      </div>

      {showCreate && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder='Код курса'
            className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500'
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder='Название курса'
            className='md:col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500'
          />
        </div>
      )}

      <div className='flex items-center gap-3 flex-wrap'>
        {showCreate && (
          <button
            type='button'
            onClick={handleSave}
            className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700'
          >
            Сохранить курс
          </button>
        )}

        <select
          value={selectedCourse}
          onChange={(e) => onSelectCourse?.(e.target.value)}
          className='px-3 py-2 border rounded-lg bg-white'
          disabled={disabled}
        >
          <option value=''>Выберите курс</option>
          {Object.entries(courses).map(([id, course]) => (
            <option key={id} value={id}>
              {course.title} ({id})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

