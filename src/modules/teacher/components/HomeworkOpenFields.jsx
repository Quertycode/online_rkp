export default function HomeworkOpenFields({ content, material, onChange }) {
  return (
    <div className='space-y-2'>
      <textarea
        className='w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
        rows={3}
        placeholder='Описание задания'
        value={content}
        onChange={(e) => onChange({ content: e.target.value })}
      />
      <input
        className='w-full rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
        placeholder='Ссылка на материал (опционально)'
        value={material}
        onChange={(e) => onChange({ material: e.target.value })}
      />
    </div>
  )
}

