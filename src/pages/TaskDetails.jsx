import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import { getTask, getCourse, getLesson } from '../utils/courseStore'
import { getCurrentUser } from '../utils/userStore'

export default function TaskDetails() {
  const { taskId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = getCurrentUser()

  const task = getTask(taskId)

  if (!task) {
    return <Card title='Задание не найдено'>Проверьте ссылку или вернитесь к занятиям.</Card>
  }

  const course = getCourse(task.subject)
  const lessonLink = `/courses/${task.subject}/${task.lessonId}`
  const lesson = getLesson(task.subject, task.lessonId)
  const type =
    task.taskType || (Array.isArray(task.questions) && task.questions.length ? 'test' : 'assignment')

  const homeworkKey = useMemo(
    () => `homework_${user?.username || 'guest'}`,
    [user?.username]
  )

  const hasQuestions = Array.isArray(task.questions) && task.questions.length > 0
  const [answer, setAnswer] = useState(hasQuestions ? task.questions.map(() => '') : '')
  const [comment, setComment] = useState('')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(homeworkKey)
      if (!raw) return
      const saved = JSON.parse(raw) || {}
      const entry = saved[`${task.subject}_${task.lessonId}_${task.id}`]
      if (!entry) return
      if (hasQuestions && Array.isArray(entry.questions)) {
        const arr = task.questions.map((q, idx) => entry.questions[idx]?.answer || '')
        setAnswer(arr)
      } else {
        setAnswer(entry.answer || '')
      }
      setComment(entry.comment || '')
      setFileName(entry.fileName || '')
      setStatus(entry.status || '')
    } catch {
      /* ignore */
    }
  }, [homeworkKey, task.id, task.lessonId, task.subject])

  const persist = (payload) => {
    try {
      const raw = localStorage.getItem(homeworkKey)
      const saved = raw ? JSON.parse(raw) : {}
      saved[`${task.subject}_${task.lessonId}_${task.id}`] = payload
      localStorage.setItem(homeworkKey, JSON.stringify(saved))
    } catch {
      /* ignore */
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (type === 'assignment') {
      if (!fileName) {
        setError('Приложите файл с ответом')
        setStatus('fail')
        return
      }
      setStatus('success')
      persist({ comment, fileName, status: 'success', type })
      return
    }

    if (hasQuestions) {
      const arr = Array.isArray(answer) ? answer : []
      if (arr.length !== task.questions.length || arr.some((v) => !String(v || '').trim())) {
        setError('Ответьте на все вопросы')
        setStatus('fail')
        return
      }
      const results = task.questions.map((q, idx) => {
        const userAns = String(arr[idx] || '')
        const correct = (q.answers || []).some(
          (v) => (v || '').toLowerCase().trim() === userAns.toLowerCase().trim()
        )
        return { id: q.id || idx, answer: userAns, correct }
      })
      const allCorrect = results.every((r) => r.correct)
      setStatus(allCorrect ? 'success' : 'fail')
      persist({ questions: results, status: allCorrect ? 'success' : 'fail', type })
      return
    }

    const scalarAnswer = String(answer || '')
    if (!scalarAnswer.trim()) {
      setError('Введите ответ')
      setStatus('fail')
      return
    }

    const isCorrect = (task.answer || []).some(
      (v) => (v || '').toLowerCase().trim() === scalarAnswer.toLowerCase().trim()
    )
    setStatus(isCorrect ? 'success' : 'fail')
    persist({ answer: scalarAnswer, status: isCorrect ? 'success' : 'fail', type })
  }

  const statusLabel =
    status === 'success' ? 'Ответ отправлен' : status === 'fail' ? 'Ответ не принят' : ''
  const statusColor =
    status === 'success' ? 'text-green-700' : status === 'fail' ? 'text-red-600' : 'text-gray-500'

  return (
    <div className='space-y-4'>
      <Card>
        <div className='flex items-center justify-between gap-3 flex-wrap'>
          <div className='space-y-2'>
            <Link
              to={lessonLink}
              state={{ focusTaskId: task.id }}
              className='inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors'
            >
              <span className='text-lg leading-none'>←</span>
              <span>{lesson?.title || course?.title || task.subject}</span>
            </Link>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='px-2 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-800 text-xs'>
                {type === 'assignment' ? 'Практикум' : 'Тестирование'}
              </span>
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>{task.question}</h1>
          </div>
        </div>

        <form className='mt-4 space-y-3' onSubmit={handleSubmit}>
          {type === 'assignment' ? (
            <>
              <label className='flex flex-col gap-2 text-sm text-gray-700'>
                Комментарий (необязательно):
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  placeholder='Комментарий к ответу'
                />
              </label>
              <label className='flex flex-col gap-2 text-sm text-gray-700'>
                Файл (обязательно):
                <input
                  type='file'
                  accept='.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setFileName(file ? file.name : '')
                    setStatus('')
                    setError('')
                  }}
                  className='text-sm'
                />
                {fileName && <span className='text-gray-600'>Файл: {fileName}</span>}
              </label>
            </>
          ) : hasQuestions ? (
            <div className='space-y-3'>
              {task.questions.map((q, idx) => (
                <label key={q.id || idx} className='flex flex-col gap-2 text-sm text-gray-700'>
                  <span className='font-semibold text-gray-800'>
                    Вопрос {idx + 1}: {q.text || q.question}
                  </span>
                  <input
                    type='text'
                    value={Array.isArray(answer) ? answer[idx] || '' : ''}
                    onChange={(e) => {
                      const next = Array.isArray(answer) ? [...answer] : task.questions.map(() => '')
                      next[idx] = e.target.value
                      setAnswer(next)
                      setStatus('')
                      setError('')
                    }}
                    className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500'
                    placeholder='Введите ответ'
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className='flex flex-col gap-2 text-sm text-gray-700'>
              Ответ:
              <input
                type={task.type === 'numeric' ? 'number' : 'text'}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value)
                  setStatus('')
                  setError('')
                }}
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500'
                placeholder='Введите ответ и нажмите Отправить'
              />
            </label>
          )}

          {error && <div className='text-sm text-red-600'>{error}</div>}
          {statusLabel && <div className={`text-sm ${statusColor}`}>{statusLabel}</div>}

          <div className='flex items-center gap-2'>
            <button
              type='submit'
              className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition text-sm'
            >
              Отправить
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

