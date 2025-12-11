import { Link } from 'react-router-dom'

/**
 * Логотип приложения
 */
export default function Logo() {
  return (
    <div className='flex items-baseline gap-1 font-bold text-lg md:text-xl text-orange-500'>
      <Link
        to='/'
        className='hover:text-orange-600 transition-colors cursor-pointer'
      >
        Эврика!
      </Link>
      <a
        href='https://yspu.org/%D0%98%D0%BD%D1%81%D1%82%D0%B8%D1%82%D1%83%D1%82_%D1%80%D0%B0%D0%B7%D0%B2%D0%B8%D1%82%D0%B8%D1%8F_%D0%BA%D0%B0%D0%B4%D1%80%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE_%D0%BF%D0%BE%D1%82%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D0%B0'
        target='_blank'
        rel='noreferrer'
        className='font-semibold text-lg md:text-xl text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer'
      >
        Институт РКП
      </a>
    </div>
  )
}

