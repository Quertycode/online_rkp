import { useState } from 'react'

/**
 * Карточка задания по занятию
 * @param {Object} task - Объект задания
 * @param {string} answer - Текущий ответ
 * @param {function} onSubmit - Функция отправки ответа
 */
export default function TaskCard({ task, answer, onSubmit }) {
  const [localAnswer, setLocalAnswer] = useState(answer || '')

  const isCorrect = () => {
    if (!localAnswer) return false
    return task.answer.some(correctAnswer => 
      correctAnswer.toLowerCase().trim() === localAnswer.toLowerCase().trim()
    )
  }

  const handleChange = (value) => {
    setLocalAnswer(value)
    onSubmit(task.id, value)
  }

  return (
    <div className='border rounded-xl p-4 bg-white'>
      <p className='font-medium mb-3'>{task.question}</p>
      <div className='space-y-2'>
        <input
          type={task.type === 'numeric' ? 'number' : 'text'}
          value={localAnswer}
          onChange={(e) => handleChange(e.target.value)}
          placeholder='Введите ответ...'
          className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500'
        />
        {localAnswer && (
          <div className={`text-sm ${
            isCorrect() ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect() ? '✓ Правильно!' : '✗ Неправильно'}
          </div>
        )}
      </div>
    </div>
  )
}

