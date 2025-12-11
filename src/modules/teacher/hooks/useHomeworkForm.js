import { useMemo, useState } from 'react'

const defaultQuestion = { question: '', answer: '' }

const initialForm = {
  title: '',
  courseId: '',
  type: 'test',
  dueDate: '',
  assignAll: true,
  selected: [],
  content: '',
  material: '',
  questions: [defaultQuestion]
}

export function useHomeworkForm(onCreate) {
  const [form, setForm] = useState(initialForm)

  const isValid = useMemo(
    () => form.title.trim() && form.courseId && form.dueDate,
    [form.title, form.courseId, form.dueDate]
  )

  const updateQuestion = (idx, key, value) =>
    setForm((prev) => {
      const next = [...prev.questions]
      next[idx] = { ...next[idx], [key]: value }
      return { ...prev, questions: next }
    })

  const addQuestion = () =>
    setForm((prev) => ({ ...prev, questions: [...prev.questions, defaultQuestion] }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    const payload = {
      title: form.title.trim(),
      courseId: form.courseId,
      type: form.type,
      dueDate: form.dueDate,
      assignAll: form.assignAll,
      assigneeIds: form.assignAll ? [] : form.selected,
      content: form.type === 'open' || form.type === 'mixed' ? form.content : '',
      material: form.type === 'open' || form.type === 'mixed' ? form.material : '',
      questions:
        form.type === 'test' || form.type === 'mixed'
          ? form.questions
              .filter((q) => q.question.trim())
              .map((q, i) => ({ id: `q-${i + 1}`, ...q }))
          : []
    }
    onCreate(payload)
    setForm(initialForm)
  }

  return {
    form,
    setForm,
    isValid,
    updateQuestion,
    addQuestion,
    handleSubmit
  }
}

