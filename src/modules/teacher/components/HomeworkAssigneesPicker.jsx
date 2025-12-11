export default function HomeworkAssigneesPicker({ assignAll, students, selectedIds, onChange }) {
  return (
    <div className='rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2'>
      <div className='flex items-center gap-4 text-sm'>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            checked={assignAll}
            onChange={() => onChange({ assignAll: true, selected: [] })}
          />
          Всем привязанным студентам
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            checked={!assignAll}
            onChange={() => onChange({ assignAll: false, selected: selectedIds })}
          />
          Выборочно
        </label>
      </div>
      {!assignAll && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {students.map((s) => (
            <label key={s.id} className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={selectedIds.includes(s.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedIds, s.id]
                    : selectedIds.filter((id) => id !== s.id)
                  onChange({ assignAll: false, selected: next })
                }}
              />
              {s.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

