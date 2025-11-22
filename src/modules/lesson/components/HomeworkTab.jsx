import TaskCard from './TaskCard'

/**
 * Таб с заданием по занятию
 * @param {Array} tasks - Массив заданий
 * @param {function} getTaskAnswer - Функция получения ответа на задание
 * @param {function} handleSubmit - Функция отправки ответа
 */
export default function HomeworkTab({ tasks, getTaskAnswer, handleSubmit }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        Нет заданий по занятию для этого урока
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Задание по занятию</h3>
      {tasks.map(task => {
        const answer = getTaskAnswer(task.id)
        
        return (
          <TaskCard
            key={task.id}
            task={task}
            answer={answer}
            onSubmit={handleSubmit}
          />
        )
      })}
    </div>
  )
}

