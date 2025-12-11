import { useEffect, useState } from 'react'
import { getLessons, removeLesson, upsertLesson } from '../../../utils/courseStore'
import { getUsers } from '../../../utils/userStore'

const emptyLesson = { id: '', title: '', description: '', order: '', video: '', materials: '', teacher: '', teacherName: '' }

export default function LessonsEditor({ selectedCourse, selectedLessonId, onSelectLesson, onSaved }) {
  const [lessons, setLessons] = useState([])
  const [form, setForm] = useState(emptyLesson)
  const [teachers, setTeachers] = useState([])

  const loadLessons = () => {
    if (!selectedCourse) {
      setLessons([])
      return
    }
    setLessons(getLessons(selectedCourse))
  }

  const loadTeachers = () => {
    const all = getUsers().filter((u) => u.role === 'teacher')
    setTeachers(all)
  }

  useEffect(() => {
    loadLessons()
    loadTeachers()
    setForm(emptyLesson)
  }, [selectedCourse])

  useEffect(() => {
    if (!selectedLessonId) return
    const target = lessons.find((l) => String(l.id) === String(selectedLessonId))
    if (target) {
      setForm({
        ...target,
        materials: (target.materials || []).join('\n')
      })
    }
  }, [selectedLessonId, lessons])

  const handleSave = () => {
    if (!selectedCourse) return
    const materialsArray = (form.materials || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const teacherData = teachers.find((t) => t.username === form.teacher)
    const saved = upsertLesson(selectedCourse, {
      ...form,
      id: form.id || undefined,
      order: form.order ? Number(form.order) : undefined,
      materials: materialsArray,
      teacherName: form.teacherName || teacherData?.firstName || teacherData?.lastName
    })
    setForm(emptyLesson)
    loadLessons()
    onSaved?.('Занятие сохранено', String(saved.id))
    onSelectLesson?.(String(saved.id))
  }

  const handleDelete = (lessonId) => {
    if (!selectedCourse || !lessonId) return
    const ok = window.confirm('Удалить занятие? Действие необратимо.')
    if (!ok) return
    removeLesson(selectedCourse, lessonId)
    loadLessons()
    if (String(selectedLessonId) === String(lessonId)) {
      const next = getLessons(selectedCourse)[0]
      onSelectLesson?.(next ? String(next.id) : '')
      setForm(emptyLesson)
    }
    onSaved?.('Занятие удалено', String(lessonId))
  }

  return (
    <div className='border border-cyan-200 rounded-xl p-4 bg-white/90 space-y-3'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <p className='text-sm text-cyan-700/70'>Занятия</p>
          <h3 className='text-lg font-semibold text-gray-900'>Создание и редактирование</h3>
        </div>
        {selectedCourse && <span className='text-sm text-gray-500'>Курс: {selectedCourse}</span>}
      </div>

      <div className='space-y-2 max-h-48 overflow-auto'>
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${String(selectedLessonId) === String(lesson.id) ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <button
              type='button'
              onClick={() => {
                onSelectLesson?.(String(lesson.id))
                setForm(lesson)
              }}
              className='text-left flex-1'
            >
              <div className='text-xs text-gray-500 mb-1'>Занятие {lesson.order || lesson.id}</div>
              <div className='text-sm font-semibold text-gray-800'>{lesson.title}</div>
            </button>
            <button
              type='button'
              onClick={() => handleDelete(lesson.id)}
              className='text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50'
            >
              Удалить
            </button>
          </div>
        ))}
        {lessons.length === 0 && <div className='text-sm text-gray-500'>Добавьте первое занятие</div>}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder='Название занятия' className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500' />
        <input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder='Порядковый номер' className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500' />
        <select
          value={form.teacher}
          onChange={(e) => {
            const teacherId = e.target.value
            const teacherData = teachers.find((t) => t.username === teacherId)
            setForm({
              ...form,
              teacher: teacherId,
              teacherName: teacherData ? `${teacherData.firstName || ''} ${teacherData.lastName || ''}`.trim() || teacherData.email || teacherId : ''
            })
          }}
          className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500'
        >
          <option value=''>Выберите преподавателя</option>
          {teachers.map((t) => (
            <option key={t.username} value={t.username}>
              {`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email || t.username}
            </option>
          ))}
        </select>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder='Описание занятия' className='md:col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 min-h-[72px]' />
        <input value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} placeholder='Ссылка на видео' className='md:col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500' />
        <textarea
          value={form.materials}
          onChange={(e) => setForm({ ...form, materials: e.target.value })}
          placeholder={'Ссылки на материалы (каждая с новой строки)\nhttps://example.com/file1.pdf\nhttps://example.com/file2.pdf'}
          className='md:col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 min-h-[80px]'
        />
      </div>

      <div className='flex items-center gap-3'>
        <button type='button' onClick={handleSave} className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700'>
          Сохранить занятие
        </button>
        <button
          type='button'
          onClick={() => {
            setForm(emptyLesson)
            onSelectLesson?.('')
          }}
          className='px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50'
        >
          Новое занятие
        </button>
        {form.id && <span className='text-xs text-gray-500'>Редактируется: {form.id}</span>}
      </div>
    </div>
  )
}

