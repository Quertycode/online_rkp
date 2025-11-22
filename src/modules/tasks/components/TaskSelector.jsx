import { getAllSubjects, getSubjectName } from '../../constants/subjects'

/**
 * Селектор предмета и кнопка случайного вопроса
 * @param {string} subject - Текущий предмет
 * @param {function} onSubjectChange - Функция смены предмета
 * @param {function} onRandomTask - Функция получения случайного задания
 */
export default function TaskSelector({ subject, onSubjectChange, onRandomTask }) {
  const subjects = getAllSubjects()
  
  return (
    <div className='flex flex-wrap gap-3 mb-3'>
      {subjects.map(subj => (
        <button 
          key={subj.code}
          onClick={() => onSubjectChange(subj.code)} 
          className={`px-4 py-2 rounded-xl border ${
            subject === subj.code
              ? 'bg-cyan-600 text-white' 
              : 'border-cyan-300 hover:bg-cyan-50'
          }`}
        >
          {subj.name}
        </button>
      ))}
      <button 
        onClick={onRandomTask} 
        className='px-4 py-2 rounded-xl border border-cyan-300 hover:bg-cyan-50'
      >
        Случайный вопрос
      </button>
    </div>
  )
}

