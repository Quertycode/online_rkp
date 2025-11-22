import WebinarModule from '../modules/home/components/WebinarModule'
import CoursesModule from '../modules/home/components/CoursesModule'
import TrainerModule from '../modules/home/components/TrainerModule'

/**
 * Главная страница - композиция модулей
 * Рефакторинг: Разбита на модульные компоненты для лучшей поддерживаемости
 */
export default function Home() {
  return (
    <div className='h-full flex flex-col min-h-0 p-4 md:p-6'>
      {/* Three Module Boxes */}
      <div className='grid grid-cols-1 lg:grid-cols-[30fr_40fr_30fr] gap-4 flex-1 min-h-0 items-start'>
        <WebinarModule />
        <CoursesModule />
        <TrainerModule />
      </div>
    </div>
  )
}
