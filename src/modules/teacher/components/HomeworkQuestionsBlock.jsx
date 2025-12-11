export default function HomeworkQuestionsBlock({ questions, onChange, onAdd }) {
  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium text-gray-800'>Вопросы</p>
      {questions.map((q, idx) => (
        <div key={idx} className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          <input
            className='rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
            placeholder='Вопрос'
            value={q.question}
            onChange={(e) => onChange(idx, 'question', e.target.value)}
          />
          <input
            className='rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
            placeholder='Ответ'
            value={q.answer}
            onChange={(e) => onChange(idx, 'answer', e.target.value)}
          />
        </div>
      ))}
      <button type='button' onClick={onAdd} className='text-sm text-cyan-700'>
        + Добавить вопрос
      </button>
    </div>
  )
}

