import Card from '../../../components/Card'

/**
 * Заголовок урока с навигацией
 * @param {Object} lesson - Объект урока
 * @param {string} subject - Предмет
 * @param {Object} children - Дочерние компоненты (табы)
 */
export default function LessonHeader({ lesson, subject, children }) {
  return <Card>{children}</Card>
}

