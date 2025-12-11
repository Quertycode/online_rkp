import TaskCard from './TaskCard'

/**
 * Таб с заданием по занятию
 * @param {Array} tasks - Массив заданий
 * @param {function} getTaskAnswer - Функция получения ответа на задание
 * @param {function} handleSubmit - Функция отправки ответа
 */
export default function HomeworkTab({ tasks, getTaskAnswer, focusTaskId, subject, lessonId }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        Нет заданий по занятию для этого урока
      </div>
    )
  }

  const classify = (task) =>
    task.taskType ||
    (task.subject === 'pract_psychology' && Number(task.id) % 2 === 0 ? 'assignment' : 'test')

  const hasAnswer = (ans) =>
    typeof ans === 'string'
      ? Boolean(ans.trim())
      : Boolean(ans?.comment) || Boolean(ans?.fileName)

  const tests = tasks.filter((t) => classify(t) === 'test')
  const assignments = tasks.filter((t) => classify(t) === 'assignment')

  const getStats = (list) => {
    const total = list.length
    const done = list.filter((t) => hasAnswer(getTaskAnswer(t.id))).length
    return { total, done }
  }

  const testStats = getStats(tests)
  const assignmentStats = getStats(assignments)

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='rounded-2xl border border-cyan-100 bg-white shadow-sm p-4 space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-base font-semibold text-gray-900'>Тестирование</span>
            <span className='text-sm text-gray-500'>{testStats.done} / {testStats.total}</span>
          </div>
          <div className='space-y-3'>
            {tests.length === 0 ? (
              <div className='text-sm text-gray-500'>Нет тестов</div>
            ) : (
              tests.map((task) => {
                const answer = getTaskAnswer(task.id)
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    answer={answer}
                    subject={subject}
                    lessonId={lessonId}
                    focused={focusTaskId && String(focusTaskId) === String(task.id)}
                  />
                )
              })
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-cyan-100 bg-white shadow-sm p-4 space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-base font-semibold text-gray-900'>Задания</span>
            <span className='text-sm text-gray-500'>{assignmentStats.done} / {assignmentStats.total}</span>
          </div>
          <div className='space-y-3'>
            {assignments.length === 0 ? (
              <div className='text-sm text-gray-500'>Нет заданий</div>
            ) : (
              assignments.map((task) => {
                const answer = getTaskAnswer(task.id)
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    answer={answer}
                    subject={subject}
                    lessonId={lessonId}
                    focused={focusTaskId && String(focusTaskId) === String(task.id)}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

