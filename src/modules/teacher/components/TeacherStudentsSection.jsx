import { useMemo, useState } from 'react'

export default function TeacherStudentsSection({ students, available = [], onAdd, onRemove, loading, error }) {
  const [selectedId, setSelectedId] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const disabled = useMemo(() => loading || !selectedId, [selectedId, loading])

  const handleAdd = (e) => {
    e.preventDefault()
    if (disabled) return
    const student = available.find((s) => s.id === selectedId)
    if (student) onAdd(student)
    setSelectedId('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 1500)
  }

  return (
    <div className='bg-white border border-cyan-100 rounded-2xl p-4 shadow-sm space-y-4'>
      <div>
        <h3 className='text-lg font-semibold text-cyan-900'>Студенты</h3>
        <p className='text-sm text-gray-600'>Привяжите студентов, чтобы выдавать задания</p>
      </div>

      <form onSubmit={handleAdd} className='space-y-3'>
        <select
          className='w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value=''>Выберите студента</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <button
          type='submit'
          disabled={disabled}
          className='w-full rounded-lg bg-cyan-600 text-white py-2 text-sm font-semibold hover:bg-cyan-700 transition disabled:opacity-60'
        >
          {loading ? 'Сохраняем...' : 'Добавить студента'}
        </button>
        {submitted && <p className='text-xs text-green-600'>Студент добавлен</p>}
      </form>

      <div className='space-y-2'>
        <p className='text-sm font-medium text-gray-800'>Привязанные студенты</p>
        {students.length === 0 ? (
          <p className='text-sm text-gray-500'>Пока нет привязанных студентов</p>
        ) : (
          <div className='space-y-2 max-h-64 overflow-auto pr-1'>
            {students.map((student) => (
              <div
                key={student.id}
                className='flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 bg-gray-50'
              >
                <div>
                  <p className='text-sm font-medium text-gray-800'>{student.name}</p>
                  <p className='text-xs text-gray-600'>{student.email}</p>
                </div>
                <button
                  type='button'
                  onClick={() => onRemove(student.id)}
                  className='text-xs text-red-600 hover:text-red-700'
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

