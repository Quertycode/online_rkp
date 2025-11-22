/**
 * Компонент для отображения описания вебинара
 * @param {string} title - Заголовок описания
 * @param {string} description - Текст описания
 */
export default function DescriptionSection({ 
  title = 'О чем это занятие:',
  description = 'Разберем все модальные глаголы для ЕГЭ, изучим разницу между различными видами конструкций и рассмотрим задания 19-24 на реальных ЕГЭ'
}) {
  return (
    <div className='flex flex-col'>
      <h3 className='text-sm font-semibold text-gray-700 mb-1 flex-shrink-0'>
        {title}
      </h3>
      <p className='text-[10px] md:text-xs text-gray-600 leading-[1.3] break-words hyphens-auto'>
        {description}
      </p>
    </div>
  )
}

