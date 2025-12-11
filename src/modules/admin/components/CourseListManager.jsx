import { useEffect, useMemo, useState } from 'react'
import { getCourses, removeCourse, upsertCourse } from '../../../utils/courseStore'

const emptyForm = { id: '', title: '' }

export default function CourseListManager() {
  const [courses, setCourses] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [status, setStatus] = useState('')

  const items = useMemo(
    () =>
      Object.entries(courses).map(([id, course]) => ({
        id,
        title: course.title || id
      })),
    [courses]
  )

  const load = () => setCourses(getCourses())

  useEffect(() => {
    load()
    const handleStorage = (e) => {
      if (!e || e.key === null || e.key === 'edumvp_courses_state_v1') {
        load()
      }
    }
    const handleEvent = () => load()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('edumvp_courses_updated', handleEvent)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('edumvp_courses_updated', handleEvent)
    }
  }, [])

  const handleSave = () => {
    if (!form.id.trim()) return
    const id = form.id.trim()
    const title = form.title.trim() || id
    upsertCourse({
      id,
      title
    })
    setForm(emptyForm)
    setEditingId('')
    setStatus('Курс сохранен')
    load()
  }

  const handleEdit = (course) => {
    setEditingId(course.id)
    setForm({
      id: course.id,
      title: course.title
    })
  }

  const handleDelete = (id) => {
    removeCourse(id)
    if (editingId === id) {
      setForm(emptyForm)
      setEditingId('')
    }
    setStatus('Курс удален')
    load()
  }

  return (
    <div className='space-y-4'>
      {status && (
        <div className='border border-green-200 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl'>
          {status}
        </div>
      )}

      <div className='border border-cyan-200 rounded-xl p-4 bg-white/90 space-y-3'>
        <div className='flex items-center justify-between gap-3 flex-wrap'>
          <div>
            <p className='text-sm text-cyan-700/70'>Курсы</p>
            <h3 className='text-lg font-semibold text-gray-900'>
              {editingId ? 'Редактировать курс' : 'Создать курс'}
            </h3>
          </div>
          {editingId && (
            <button
              type='button'
              onClick={() => {
                setEditingId('')
                setForm(emptyForm)
              }}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Очистить форму
            </button>
          )}
        </div>

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

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleSave}
            className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700'
          >
            {editingId ? 'Обновить курс' : 'Создать курс'}
          </button>
        </div>
      </div>

      <div className='border border-gray-200 rounded-xl p-4 bg-white space-y-2'>
        <h4 className='text-md font-semibold text-gray-900'>Список курсов</h4>
        {items.length === 0 ? (
          <div className='text-sm text-gray-500'>Курсы отсутствуют</div>
        ) : (
          <div className='space-y-2 max-h-[360px] overflow-auto'>
            {items.map((c) => (
              <div
                key={c.id}
                className='flex items-start gap-3 border border-gray-100 rounded-lg p-3 hover:border-cyan-200'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-gray-900'>{c.title}</span>
                    <span className='text-xs text-gray-500'>({c.id})</span>
                  </div>
                  
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => handleEdit(c)}
                    className='text-sm px-3 py-1 rounded-lg border border-cyan-200 text-cyan-800 hover:bg-cyan-50'
                  >
                    Редактировать
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDelete(c.id)}
                    className='text-sm px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50'
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

