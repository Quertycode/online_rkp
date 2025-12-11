import HomeworkAssigneesPicker from './HomeworkAssigneesPicker'
import HomeworkMainFields from './HomeworkMainFields'
import HomeworkOpenFields from './HomeworkOpenFields'
import HomeworkQuestionsBlock from './HomeworkQuestionsBlock'
import { useHomeworkForm } from '../hooks/useHomeworkForm'

export default function CreateHomeworkForm({ courses, students, onCreate, loading }) {
  const { form, setForm, isValid, updateQuestion, addQuestion, handleSubmit } = useHomeworkForm(onCreate)

  return (
    <div className='bg-white border border-cyan-100 rounded-2xl p-4 shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <div>
          <p className='text-sm text-cyan-700/70'>Новое задание</p>
          <h3 className='text-lg font-semibold text-gray-900'>Создать домашнее задание</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} className='space-y-3'>
        <HomeworkMainFields form={form} setForm={setForm} courses={courses} />

        <HomeworkAssigneesPicker
          assignAll={form.assignAll}
          students={students}
          selectedIds={form.selected}
          onChange={({ assignAll, selected }) =>
            setForm((v) => ({ ...v, assignAll, selected: selected || [] }))
          }
        />

        {(form.type === 'open' || form.type === 'mixed') && (
          <HomeworkOpenFields
            content={form.content}
            material={form.material}
            onChange={(values) => setForm((v) => ({ ...v, ...values }))}
          />
        )}

        {(form.type === 'test' || form.type === 'mixed') && (
          <HomeworkQuestionsBlock
            questions={form.questions}
            onChange={updateQuestion}
            onAdd={addQuestion}
          />
        )}

        <div className='flex items-center justify-end'>
          <button
            type='submit'
            disabled={!isValid || loading}
            className='rounded-lg bg-cyan-600 text-white px-4 py-2 text-sm font-semibold hover:bg-cyan-700 transition disabled:opacity-60'
          >
            {loading ? 'Сохраняем...' : 'Создать задание'}
          </button>
        </div>
      </form>
    </div>
  )
}

