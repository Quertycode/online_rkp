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

  const isTest = (task) =>
    task.taskType === 'test' || (Array.isArray(task.questions) && task.questions.length > 0)

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

  const [expandedPractice, setExpandedPractice] = useState({})
  const [expandedTests, setExpandedTests] = useState({})

  const toggleExpandPractice = (lessonId) =>
    setExpandedPractice((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }))
  const toggleExpandTests = (lessonId) =>
    setExpandedTests((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }))

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='space-y-4'>
        {grouped.map((group) => {
          const list = group.tasks.filter((t) => !isTest(t))
          if (!list.length) return null
          const totalDone = list.filter((t) => completedSet.has(String(t.id))).length
          const showAll = expandedPractice[group.lessonId]
          const sliceTasks = showAll ? list : list.slice(0, 5)

          return (
            <div
              key={`practice-${group.lessonId}`}
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
                  {totalDone} / {list.length}
                </span>
              </div>

              <div className='space-y-2'>
                {sliceTasks.map((task) => (
                  <PracticeTaskCard
                    key={task.id}
                    task={task}
                    subject={subject}
                    completed={completedSet.has(String(task.id))}
                  />
                ))}
                {list.length > 5 && !showAll && (
                  <div className='text-xs text-gray-500'>Показано 5 из {list.length}</div>
                )}
              </div>

              {list.length > 5 && (
                <div className='pt-2'>
                  <button
                    type='button'
                    onClick={() => toggleExpandPractice(group.lessonId)}
                    className='text-sm px-3 py-2 rounded-xl border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 transition'
                  >
                    {showAll ? 'Скрыть' : 'Посмотреть все'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className='space-y-4'>
        {grouped.map((group) => {
          const list = group.tasks.filter(isTest)
          if (!list.length) return null
          const totalDone = list.filter((t) => completedSet.has(String(t.id))).length
          const showAll = expandedTests[group.lessonId]
          const sliceTasks = showAll ? list : list.slice(0, 5)

          return (
            <div
              key={`test-${group.lessonId}`}
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
                  {totalDone} / {list.length}
                </span>
              </div>

              <div className='space-y-2'>
                {sliceTasks.map((task) => (
                  <PracticeTaskCard
                    key={task.id}
                    task={task}
                    subject={subject}
                    completed={completedSet.has(String(task.id))}
                  />
                ))}
                {list.length > 5 && !showAll && (
                  <div className='text-xs text-gray-500'>Показано 5 из {list.length}</div>
                )}
              </div>

              {list.length > 5 && (
                <div className='pt-2'>
                  <button
                    type='button'
                    onClick={() => toggleExpandTests(group.lessonId)}
                    className='text-sm px-3 py-2 rounded-xl border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 transition'
                  >
                    {showAll ? 'Скрыть' : 'Посмотреть все'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
