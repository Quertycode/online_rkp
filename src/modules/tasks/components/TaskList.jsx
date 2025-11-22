import TaskItem from './TaskItem'

export default function TaskList({ tasks, solvedIds, onSolve }) {
  if (!tasks?.length) {
    return (
      <div className="text-sm text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90">
        Ничего не найдено.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map(t => (
        <TaskItem key={t.id} task={t} isSolved={solvedIds.includes(t.id)} onSolve={onSolve} />)
      )}
    </div>
  )
}


