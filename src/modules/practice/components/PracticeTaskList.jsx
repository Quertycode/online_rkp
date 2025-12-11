import { useState } from 'react'
import { Link } from 'react-router-dom'
import PracticeTaskCard from './PracticeTaskCard'

export default function PracticeTaskList({
  tasks,
  subject,
  completedSet,
  onComplete,
  onReset,
}) {
  if (!tasks.length) {
    return (
      <div className='rounded-2xl border border-cyan-100 bg-white p-6 text-center text-gray-600'>
        Задания не найдены для выбранного курса.
      </div>
    )
  }

  const grouped = Object.values(
    tasks.reduce((acc, task) => {
      const key = String(task.lessonId)
      const entry = acc[key] || {
        lessonId: task.lessonId,
        lessonOrder: task.lessonOrder || task.lessonId,
        lessonTitle: task.lessonTitle,
        tasks: [],
      }
      entry.tasks.push(task)
      acc[key] = entry
      return acc
    }, {})
  ).sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0))

  const [showHidden, setShowHidden] = useState(false)

  const visibleGroups = []
  const hiddenGroups = []
  grouped.forEach((group) => {
    const total = group.tasks.length
    const done = group.tasks.filter((t) => completedSet.has(String(t.id))).length
    if (total > 0 && done === total) hiddenGroups.push(group)
    else visibleGroups.push(group)
  })

  const groupsToRender = showHidden ? grouped : visibleGroups
  const hiddenCount = hiddenGroups.length

  return (
    <div className='space-y-4'>
      {hiddenCount > 0 && (
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() => setShowHidden((v) => !v)}
            className='text-sm px-3 py-2 rounded-xl border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 transition'
          >
            {showHidden ? 'Скрыть выполненные' : `Показать выполненные (${hiddenCount})`}
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {groupsToRender.map((group) => {
        const total = group.tasks.length
        const done = group.tasks.filter((t) => completedSet.has(String(t.id))).length

        return (
          <div
            key={group.lessonId}
            className='rounded-2xl border border-cyan-100 bg-white shadow-sm p-4 space-y-3'
          >
            <div className='flex items-start justify-between gap-2'>
              <Link
                to={`/courses/${subject}/${group.lessonId}`}
                className='flex items-center gap-2 overflow-hidden text-base text-gray-700 hover:text-orange-600 transition'
              >
                <span className='px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm shrink-0'>
                  Занятие {group.lessonOrder}
                </span>
                <span className='flex-1 min-w-0 truncate whitespace-nowrap font-semibold text-base text-gray-900 hover:text-orange-700'>
                  {group.lessonTitle}
                </span>
              </Link>
              <span className='text-xs text-gray-500 whitespace-nowrap'>
                {done} / {total}
              </span>
            </div>

            <div className='space-y-3'>
              {group.tasks.map((task, idx) => (
                <PracticeTaskCard
                  key={task.id}
                  task={task}
                  subject={subject}
                  completed={completedSet.has(String(task.id))}
                  displayIndex={idx + 1}
                  onComplete={onComplete}
                  onReset={onReset}
                />
              ))}
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}


