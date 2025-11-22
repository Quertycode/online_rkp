/**
 * Компонент отображения задачи в тренажере
 * @param {Object} task - Объект задания
 * @param {string} userAnswer - Текущий ответ пользователя
 * @param {function} onAnswerChange - Функция изменения ответа
 * @param {boolean|null} isCorrect - Результат проверки (null - не проверено, true - правильно, false - неправильно)
 */
export default function TrainerTaskDisplay({ task, userAnswer, onAnswerChange, isCorrect }) {
  const handleChange = (value) => {
    onAnswerChange(value)
  }

  if (!task) {
    return (
      <div className='text-center py-4 text-gray-500'>
        <p>Задания не найдены</p>
        <p className='text-sm mt-2'>Выберите предметы в настройках профиля</p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {/* Вопрос */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
        <p className='text-gray-800'>{task.question}</p>
      </div>
      
      {/* Поле ввода */}
      <div className='space-y-2'>
        <input
          type={task.type === 'numeric' ? 'number' : 'text'}
          value={userAnswer || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder='Введите ответ...'
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm'
        />
        
        {isCorrect !== null && (
          <div className={`text-sm font-medium ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? '✓ Правильно!' : '✗ Неправильно. Попробуйте ещё раз'}
          </div>
        )}
      </div>
    </div>
  )
}
