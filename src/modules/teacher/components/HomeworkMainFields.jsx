export default function HomeworkMainFields({ form, setForm, courses }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      <input
        className='rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
        placeholder='Название задания'
        value={form.title}
        onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
      />
      <select
        className='rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
        value={form.courseId}
        onChange={(e) => setForm((v) => ({ ...v, courseId: e.target.value }))}
      >
        <option value='' disabled>
          — Выберите курс —
        </option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <div className='flex items-center gap-3 text-sm flex-wrap'>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            checked={form.type === 'test'}
            onChange={() => setForm((v) => ({ ...v, type: 'test' }))}
          />
          Тест
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            checked={form.type === 'open'}
            onChange={() => setForm((v) => ({ ...v, type: 'open' }))}
          />
          Открытое
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='radio'
            checked={form.type === 'mixed'}
            onChange={() => setForm((v) => ({ ...v, type: 'mixed' }))}
          />
          Тест + открытое
        </label>
      </div>
      <input
        type='date'
        className='rounded-lg border border-cyan-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500'
        value={form.dueDate}
        onChange={(e) => setForm((v) => ({ ...v, dueDate: e.target.value }))}
      />
    </div>
  )
}

