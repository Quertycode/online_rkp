import { useEffect, useState } from 'react'
import { attachTaskToLesson, getLessonTasks, upsertTask } from '../../../utils/courseStore'

const emptyTask = { id: '', question: '', answers: '', type: 'text' }

export default function TasksEditor({ selectedCourse, selectedLessonId, onSaved }) {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyTask)

  const loadTasks = () => {
    if (!selectedCourse || !selectedLessonId) {
      setTasks([])
      return
    }
    setTasks(getLessonTasks(selectedCourse, selectedLessonId))
  }

  useEffect(() => {
    loadTasks()
    setForm(emptyTask)
  }, [selectedCourse, selectedLessonId])

  const handleSave = () => {
    if (!selectedCourse || !selectedLessonId || !form.question.trim()) return
    const answers = form.answers.split(',').map((a) => a.trim()).filter(Boolean)
    const task = upsertTask({
      id: form.id || undefined,
      subject: selectedCourse,
      lessonId: selectedLessonId,
      question: form.question,
      answer: answers,
      type: form.type || 'text'
    })
    attachTaskToLesson(selectedCourse, selectedLessonId, task.id)
    setForm(emptyTask)
    loadTasks()
    onSaved?.('Практическое задание сохранено')
  }

  return (
    <div className='border border-cyan-200 rounded-xl p-4 bg-white/90 space-y-3'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <p className='text-sm text-cyan-700/70'>Практические задания</p>
          <h3 className='text-lg font-semibold text-gray-900'>Для выбранного занятия</h3>
        </div>
        {selectedLessonId && (
          <span className='text-sm text-gray-500'>Занятие: {selectedLessonId}</span>
        )}
      </div>

      <div className='space-y-2 max-h-40 overflow-auto'>
        {tasks.map((task) => (
          <button
            key={task.id}
            type='button'
            onClick={() =>
              setForm({
                id: task.id,
                question: task.question,
                answers: (task.answer || []).join(', '),
                type: task.type || 'text'
              })
            }
            className='w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50'
          >
            <div className='text-xs text-gray-500 mb-1'>{task.type || 'text'}</div>
            <div className='text-sm text-gray-800 line-clamp-2'>{task.question}</div>
          </button>
        ))}
        {tasks.length === 0 && <div className='text-sm text-gray-500'>Добавьте практическое задание</div>}
      </div>

      <div className='space-y-2'>
        <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder='Текст задания' className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500' />
        <input value={form.answers} onChange={(e) => setForm({ ...form, answers: e.target.value })} placeholder='Правильные ответы (через запятую)' className='px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500' />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className='px-3 py-2 border rounded-lg bg-white'>
          <option value='text'>Текстовый ответ</option>
          <option value='numeric'>Числовой ответ</option>
          <option value='single'>Один вариант</option>
        </select>
        <button type='button' onClick={handleSave} className='px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700'>
          Сохранить задание
        </button>
      </div>
    </div>
  )
}

