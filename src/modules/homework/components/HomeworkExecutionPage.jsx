import { Link, useNavigate, useParams } from 'react-router-dom'
import HomeworkAnswerForm from './HomeworkAnswerForm'
import { useHomeworkExecution } from '../hooks/useHomeworkExecution'
import { getSubjectName } from '../../../constants/subjects'

export default function HomeworkExecutionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { homework, submission, error, loading, saveDraftAnswers, submitAnswers } = useHomeworkExecution(id)

  if (loading) {
    return <div className='w-full max-w-[1280px] mx-auto px-6 py-6'>Загружаем...</div>
  }

  if (!homework) {
    return (
      <div className='w-full max-w-[1280px] mx-auto px-6 py-6 space-y-3'>
        <p className='text-sm text-red-600'>{error || 'Задание не найдено'}</p>
        <button
          type='button'
          onClick={() => navigate('/homework')}
          className='text-sm text-cyan-700 underline'
        >
          Назад к списку
        </button>
      </div>
    )
  }

  return (
    <div className='w-full max-w-[1280px] mx-auto px-6 py-6 space-y-4'>
      <div className='flex items-start justify-between gap-4 flex-col md:flex-row'>
        <div>
          <p className='text-sm text-cyan-700/70'>Домашнее задание</p>
          <h1 className='text-2xl font-semibold text-gray-900'>{homework.title}</h1>
          <p className='text-sm text-gray-600'>{getSubjectName(homework.courseId)} · До {homework.dueDate}</p>
        </div>
        <Link to='/homework' className='text-sm text-cyan-700 underline'>
          Вернуться к списку
        </Link>
      </div>

      {(homework.type === 'open' || homework.type === 'mixed') && homework.material && (
        <a
          href={homework.material}
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-2 text-sm text-cyan-700 underline'
        >
          Материал к заданию
        </a>
      )}

      {(homework.type === 'open' || homework.type === 'mixed') && (
        <div className='rounded-2xl border border-gray-100 bg-white p-4'>
          <p className='text-sm text-gray-800 whitespace-pre-line'>{homework.content}</p>
        </div>
      )}

      <div className='rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm'>
        <HomeworkAnswerForm
          homework={homework}
          submission={submission}
          onSaveDraft={saveDraftAnswers}
          onSubmit={submitAnswers}
        />
      </div>
    </div>
  )
}

