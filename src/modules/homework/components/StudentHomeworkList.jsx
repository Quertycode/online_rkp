import StudentHomeworkCard from './StudentHomeworkCard'

export default function StudentHomeworkList({ items, submissions, onOpen }) {
  if (!items.length) {
    return (
      <div className='rounded-2xl border border-dashed border-cyan-200 p-6 bg-white text-center'>
        <p className='text-sm text-gray-600'>Пока нет назначенных домашних заданий.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {items.map((hw) => (
        <StudentHomeworkCard
          key={hw.id}
          homework={hw}
          submission={submissions[hw.id]}
          onOpen={() => onOpen(hw.id)}
        />
      ))}
    </div>
  )
}

