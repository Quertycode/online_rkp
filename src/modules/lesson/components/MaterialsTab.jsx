/**
 * Таб с материалами урока
 * @param {Array} materials - Массив материалов
 */
export default function MaterialsTab({ materials }) {
  if (!materials || materials.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        Материалы не загружены
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Материалы к занятию</h3>
      {materials.map((material, index) => (
        <div key={index} className='border rounded-xl p-4 bg-white'>
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <div>
              <p className='font-medium'>Материал {index + 1}</p>
              <p className='text-sm text-gray-600'>{material}</p>
            </div>
            <a
              href={material}
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition'
            >
              Скачать
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

