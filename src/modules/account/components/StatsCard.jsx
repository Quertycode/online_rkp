import Card from '../../../components/Card'
import { getSubjectName } from '../../../constants/subjects'

/**
 * Карточка статистики пользователя
 */
export default function StatsCard({ stats }) {
  const percent = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  const subjectEntries = Object.entries(stats.subjects || {})

  return (
    <Card title='Статистика'>
      <div className='flex flex-wrap gap-4'>
        <div className='px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200'>
          Всего попыток: <b>{stats.total}</b>
        </div>
        <div className='px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200'>
          Верных ответов: <b>{stats.correct}</b>
        </div>
        <div className='px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200'>
          Успеваемость: <b>{percent}%</b>
        </div>
      </div>
      <div className='mt-4'>
        <h3 className='font-semibold mb-2'>По предметам</h3>
        <div className='grid sm:grid-cols-2 gap-3'>
          {subjectEntries.map(([subject, summary]) => {
            const subjectPercent = summary.total
              ? Math.round((summary.correct / summary.total) * 100)
              : 0
            const subjectLabel = getSubjectName(subject) || subject
            return (
              <div key={subject} className='border border-cyan-200 rounded-xl p-3'>
                <div className='mb-1 font-medium'>{subjectLabel}</div>
                <div className='text-sm text-gray-600'>
                  Попыток: {summary.total}, верных: {summary.correct}, успеваемость:{' '}
                  {subjectPercent}%
                </div>
              </div>
            )
          })}
          {subjectEntries.length === 0 && (
            <div className='text-gray-500'>
              Статистика пока пустая: решите несколько заданий, чтобы увидеть прогресс.
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

