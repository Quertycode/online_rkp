import { useEffect, useState } from 'react'

export default function HomeworkAnswerForm({ homework, submission, onSaveDraft, onSubmit }) {
  const [answers, setAnswers] = useState({})
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const locked = submission?.status === 'submitted' || submission?.status === 'graded'

  useEffect(() => {
    setAnswers(submission?.answers || {})
  }, [submission])

  const handleChange = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }))

  const handleDraft = () => {
    if (locked) return
    onSaveDraft(answers)
    setMessage('Черновик сохранен')
  }

  const handleSubmit = async () => {
    if (locked) return
    setSending(true)
    await onSubmit(answers)
    setMessage('Ответ отправлен')
    setSending(false)
  }

  return (
    <div className='space-y-4'>
      {homework.type === 'test' ? (
        homework.questions?.map((q) => (
          <div key={q.id} className='space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3'>
            <p className='text-sm font-semibold text-gray-800'>{q.question}</p>
            <input
              className='w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
              placeholder='Ваш ответ'
              value={answers[q.id] || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={locked}
            />
          </div>
        ))
      ) : (
        <div className='space-y-2'>
          <p className='text-sm text-gray-700'>Ответ</p>
          <textarea
            className='w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
            rows={6}
            value={answers.openAnswer || ''}
            onChange={(e) => handleChange('openAnswer', e.target.value)}
            disabled={locked}
          />
        </div>
      )}

      <div className='flex flex-wrap gap-2 justify-end'>
        <button
          type='button'
          onClick={handleDraft}
          className='rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 bg-white hover:bg-cyan-50 disabled:opacity-60'
          disabled={locked}
        >
          Сохранить черновик
        </button>
        <button
          type='button'
          disabled={sending}
          onClick={handleSubmit}
          className='rounded-lg bg-cyan-600 text-white px-4 py-2 text-sm font-semibold hover:bg-cyan-700 transition disabled:opacity-60'
        >
          {sending ? 'Отправляем...' : 'Отправить'}
        </button>
      </div>
      {message && <p className='text-xs text-green-700'>{message}</p>}
      {submission?.grade && (
        <p className='text-sm text-gray-700'>Результат теста: {submission.grade}</p>
      )}
      {submission?.feedback && (
        <div className='rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-800'>
          Комментарий преподавателя: {submission.feedback}
        </div>
      )}
    </div>
  )
}

