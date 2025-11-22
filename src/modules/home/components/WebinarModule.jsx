import Card from '../../../components/Card'
import { useWebinarTimer } from '../hooks/useWebinarTimer'
import VideoIframe from './VideoIframe'
import TimerSection from './TimerSection'
import DescriptionSection from './DescriptionSection'

/**
 * Модуль "Ближайший вебинар"
 * Отображает YouTube видео, таймер и описание
 */
export default function WebinarModule() {
  const targetDate = new Date('2025-11-06T00:00:00').getTime()
  const timeLeft = useWebinarTimer(targetDate)

  return (
    <Card className='flex flex-col p-0 overflow-hidden'>
      {/* Header Section */}
      <div className='px-3 pt-0 pb-2 flex-shrink-0'>
        <div className='text-center mb-2'>
          <h2 className='text-lg md:text-xl font-semibold text-cyan-800 whitespace-nowrap'>
            Ближайший вебинар
          </h2>
        </div>
        <div className='h-0.5 bg-cyan-200'></div>
      </div>

      {/* Video Section */}
      <div className='px-3 pb-2 flex-shrink-0'>
        <VideoIframe 
          videoUrl='https://www.youtube.com/embed/7RhFlrACEbI?start=4972&autoplay=0&controls=1&modestbranding=1'
          title='Ближайший вебинар'
        />
      </div>

      {/* Timer Section */}
      <div className='px-3 pb-2 flex-shrink-0'>
        <TimerSection timeLeft={timeLeft} />
      </div>

      {/* Description Section */}
      <div className='px-3 pb-3 flex flex-col'>
        <DescriptionSection />
      </div>
    </Card>
  )
}

