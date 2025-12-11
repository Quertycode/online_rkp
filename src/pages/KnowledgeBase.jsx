import { useParams, Navigate } from 'react-router-dom'
import Card from '../components/Card'
import { getCourse } from '../utils/courseStore'
import { getSubjectName } from '../constants/subjects'

export default function KnowledgeBase() {
  const { subject } = useParams()
  
  // Проверяем, существует ли предмет
  if (!getCourse(subject)) {
    return <Navigate to='/404' replace />
  }
  
  const subjectName = getSubjectName(subject) || subject
  
  return (
    <div className='space-y-6'>
      <Card>
        <h1 className='text-3xl font-bold text-cyan-800 mb-4'>
          Материалы по предмету: {subjectName}
        </h1>
        <p className='text-gray-600 mb-4'>
          Здесь будут храниться учебные материалы и ресурсы по {subjectName.toLowerCase()}.
        </p>
        <p className='text-gray-500 text-sm'>
          Контент скоро будет добавлен...
        </p>
      </Card>
    </div>
  )
}

