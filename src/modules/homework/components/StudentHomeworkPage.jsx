import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentHomeworkList from './StudentHomeworkList'
import { useStudentHomeworks } from '../hooks/useStudentHomeworks'

export default function StudentHomeworkPage() {
  const navigate = useNavigate()
  const { student, items, submissions, loading, error } = useStudentHomeworks()
  const [filter, setFilter] = useState('all')

  const withStatus = useMemo(() => {
    const now = new Date()
    return items.map((hw) => {
      const sub = submissions[hw.id]
      const isSubmitted = sub?.status === 'submitted' || sub?.status === 'graded'
      const overdue = new Date(hw.dueDate) < now && !isSubmitted
      const status = isSubmitted ? 'submitted' : overdue ? 'overdue' : 'draft'
      return { ...hw, _status: status }
    })
  }, [items, submissions])

  const filtered = useMemo(() => {
    if (filter === 'all') return withStatus
    return withStatus.filter((hw) => hw._status === filter)
  }, [filter, withStatus])

  const counts = useMemo(() => {
    return withStatus.reduce(
      (acc, hw) => {
        acc[hw._status] += 1
        acc.all += 1
        return acc
      },
      { draft: 0, submitted: 0, overdue: 0, all: 0 }
    )
  }, [withStatus])

  if (!student) {
    return (
      <div className='w-full max-w-[1280px] mx-auto px-6 py-6'>
        <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
          <h2 className='text-lg font-semibold text-red-700 mb-2'>Нет доступа</h2>
          <p className='text-sm text-red-700/80'>Авторизуйтесь как студент, чтобы видеть домашку.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-[1280px] mx-auto px-6 py-6 space-y-4'>
      <div className='flex items-start justify-between gap-4 flex-col md:flex-row'>
        <div>
          <p className='text-sm text-cyan-700/70'>Домашние задания</p>
          <h1 className='text-2xl font-semibold text-gray-900'>Назначенные задания</h1>
        </div>
        <div className='text-sm text-gray-600'>
          Всего: {items.length} | Отправлено: {Object.values(submissions).filter((s) => s?.status === 'submitted' || s?.status === 'graded').length}
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {[
          { key: 'draft', label: 'В процессе' },
          { key: 'submitted', label: 'Отправлены' },
          { key: 'overdue', label: 'Просрочены' },
          { key: 'all', label: 'Все' },
        ].map((btn) => (
          <button
            key={btn.key}
            type='button'
            onClick={() => setFilter(btn.key)}
            className={`rounded-full px-4 py-2 text-sm border transition ${
              filter === btn.key
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-cyan-50'
            }`}
          >
            {btn.label} ({counts[btn.key] ?? 0})
          </button>
        ))}
      </div>

      {error && <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>}
      {loading ? (
        <div className='rounded-2xl border border-cyan-100 p-4 bg-white'>Загружаем...</div>
      ) : (
        <StudentHomeworkList items={filtered} submissions={submissions} onOpen={(id) => navigate(`/homework/${id}`)} />
      )}
    </div>
  )
}

