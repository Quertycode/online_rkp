import TrainerModule from '../modules/home/components/TrainerModule'

/**
 * Страница тренажера - случайные задания по предметам
 */
export default function Trainer() {
  return (
    <div className='h-full flex flex-col min-h-0 p-4 md:p-6'>
      <div className='max-w-2xl mx-auto w-full'>
        <TrainerModule />
      </div>
    </div>
  )
}

