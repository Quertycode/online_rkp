/**
 * Утилиты для работы с пользователями
 */

export function getDisplayName(user, fullUser) {
  if (!user) return { firstName: '', lastName: '' }
  const first = fullUser?.firstName || user.firstName || ''
  const last = fullUser?.lastName || user.lastName || ''
  return { firstName: first, lastName: last }
}

export function getGreetingName(user, fullUser) {
  if (!user) return ''
  const fullName = [fullUser?.firstName || user.firstName, fullUser?.lastName || user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return fullName || fullUser?.email || user.email || user.username
}

/**
 * Маппинг направлений (directions) в предметы (subjects)
 */
export const AVAILABLE_DIRECTIONS = [
  { id: 'math-profile', name: 'Математика (профильная)', examType: 'EGE', subjectKey: 'math' },
  { id: 'math-base', name: 'Математика (базовая)', examType: 'EGE', subjectKey: 'mathb' },
  { id: 'rus', name: 'Русский язык', examType: 'EGE', subjectKey: 'rus' },
  { id: 'phys', name: 'Физика', examType: 'EGE', subjectKey: 'phys' },
  { id: 'inf', name: 'Информатика', examType: 'EGE', subjectKey: 'inf' },
  { id: 'bio', name: 'Биология', examType: 'EGE', subjectKey: 'bio' },
  { id: 'chem', name: 'Химия', examType: 'EGE', subjectKey: 'chem' },
  { id: 'geo', name: 'География', examType: 'EGE', subjectKey: 'geo' },
  { id: 'soc', name: 'Обществознание', examType: 'EGE', subjectKey: 'soc' },
  { id: 'hist', name: 'История', examType: 'EGE', subjectKey: 'hist' },
  { id: 'lit', name: 'Литература', examType: 'EGE', subjectKey: 'lit' },
  { id: 'en', name: 'Английский язык', examType: 'EGE', subjectKey: 'en' },
  { id: 'de', name: 'Немецкий язык', examType: 'EGE', subjectKey: 'de' },
  { id: 'fr', name: 'Французский язык', examType: 'EGE', subjectKey: 'fr' },
  { id: 'sp', name: 'Испанский язык', examType: 'EGE', subjectKey: 'sp' },
]

/**
 * Получить subjectKey по directionId
 */
export function getSubjectKeyByDirectionId(directionId) {
  const direction = AVAILABLE_DIRECTIONS.find(d => d.id === directionId)
  return direction?.subjectKey || null
}

/**
 * Получить direction по ID
 */
export function getDirectionById(directionId) {
  return AVAILABLE_DIRECTIONS.find(d => d.id === directionId) || null
}

/**
 * Получить направления пользователя с маппингом на предметы
 */
export function getUserDirectionsWithSubjects(userDirections = []) {
  return userDirections
    .map(id => {
      const direction = getDirectionById(id)
      return direction ? {
        id: direction.id,
        name: direction.name,
        subjectKey: direction.subjectKey
      } : null
    })
    .filter(Boolean)
}

