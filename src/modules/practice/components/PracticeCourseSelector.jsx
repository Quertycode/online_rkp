export default function PracticeCourseSelector({ options, value, onChange }) {
  if (!options.length) return null

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-sm text-gray-600'>Выберите курс</div>
      <div className='flex flex-wrap gap-2'>
        {options.map(({ code, title }) => {
          const active = code === value
          return (
            <button
              key={code}
              type='button'
              onClick={() => onChange(code)}
              className={`px-4 py-2 rounded-xl border text-sm transition ${
                active
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              {title}
            </button>
          )
        })}
      </div>
    </div>
  )
}


