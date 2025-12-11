/**
 * Фильтр уроков (в работе / все)
 * @param {string} filter - Текущий фильтр
 * @param {function} onFilterChange - Функция смены фильтра
 */
export default function LessonFilter({ filter, onFilterChange }) {
  return (
    <div className='flex gap-2'>
      <button
        onClick={() => onFilterChange('active')}
        className={`px-4 py-2 rounded-xl transition ${
          filter === 'active'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        В работе
      </button>
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-xl transition ${
          filter === 'all'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        Все занятия
      </button>
    </div>
  )
}

