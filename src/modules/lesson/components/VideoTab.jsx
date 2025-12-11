/**
 * Таб с видео урока
 * @param {Object} lesson - Объект урока
 * @param {function} onMarkAsWatched - Функция отметки как просмотренного
 */
export default function VideoTab({ lesson, onMarkAsWatched }) {
  return (
    <div className='space-y-4'>
      <div className='aspect-video bg-gray-100 rounded-xl overflow-hidden'>
        <iframe
          src={lesson.video}
          className='w-full h-full'
          allowFullScreen
          title={lesson.title}
        />
      </div>
      <button
        onClick={onMarkAsWatched}
        className='px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition'
      >
        Отметить как просмотренное
      </button>
    </div>
  )
}

