export default function StudentProgressBoard({ students = [], progress = {}, loading, onRefresh }) {
  return (
    <div className='bg-white border border-cyan-100 rounded-2xl p-4 shadow-sm space-y-4'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <p className='text-sm text-cyan-700/70'>Прогресс студентов</p>
          <h2 className='text-lg font-semibold text-gray-900'>Видеоуроки и практические задания</h2>
        </div>
        <button
          type='button'
          onClick={onRefresh}
          className='px-3 py-2 text-sm font-semibold rounded-lg border border-cyan-200 text-cyan-800 hover:bg-cyan-50'
        >
          Обновить
        </button>
      </div>

      {loading ? (
        <div className='text-sm text-gray-600'>Загружаем прогресс...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {students.map((student) => {
            const data = progress[student.id] || { lessons: [], submissions: [] }
            const completedHomeworks = data.submissions.filter((s) => s.status !== 'draft')

            return (
              <div
                key={student.id}
                className='rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm space-y-3'
              >
                <div>
                  <p className='text-sm font-semibold text-gray-900'>{student.name || student.id}</p>
                  <p className='text-xs text-gray-600'>{student.email}</p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs uppercase tracking-wide text-gray-500'>Уроки</span>
                    <span className='text-xs text-gray-600'>
                      {data.lessons.filter((l) => l.watched || l.completed).length} завершено
                    </span>
                  </div>
                  {data.lessons.length === 0 ? (
                    <p className='text-sm text-gray-600'>Нет данных по просмотрам</p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {data.lessons.map((lesson) => (
                        <div
                          key={`${lesson.subject}_${lesson.lessonId}`}
                          className='px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm min-w-[220px]'
                        >
                          <p className='text-xs font-semibold text-cyan-800'>
                            {lesson.subjectTitle}
                          </p>
                          <p className='text-xs text-gray-700 line-clamp-2'>{lesson.lessonTitle}</p>
                          <div className='flex items-center gap-2 mt-1 text-[11px]'>
                            <StatusPill active={lesson.watched} label='Видео' />
                            <StatusPill active={lesson.completed} label='Практическое задание' />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs uppercase tracking-wide text-gray-500'>Практические задания</span>
                    <span className='text-xs text-gray-600'>{completedHomeworks.length} сданы</span>
                  </div>
                  {completedHomeworks.length === 0 ? (
                    <p className='text-sm text-gray-600'>Пока нет выполненных практических заданий</p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {completedHomeworks.map((submission) => (
                        <span
                          key={submission.id}
                          className='px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs border border-green-200'
                        >
                          Практическое задание {submission.homeworkId} • {submission.status === 'graded' ? 'оценено' : 'сдано'}
                          {submission.grade ? ` · ${submission.grade}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusPill({ active, label }) {
  const base = 'px-2 py-1 rounded-full border text-[11px]'
  const styles = active
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-500 border-gray-200'

  return <span className={`${base} ${styles}`}>{label}</span>
}


