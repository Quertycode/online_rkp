/**
 * Компонент табов для урока
 * @param {string} activeTab - Активный таб
 * @param {function} onTabChange - Функция смены таба
 */
export default function LessonTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'video', label: 'Видео' },
    { id: 'materials', label: 'Материалы' }
  ]

  return (
    <div className='flex gap-2 mb-6'>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === tab.id
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

