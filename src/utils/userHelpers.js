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
import { getCourses } from './courseStore'

export const AVAILABLE_DIRECTIONS = [
  { id: 'pract-psychology', name: 'Практическая психология', examType: 'GENERAL', subjectKey: 'pract_psychology' },
  { id: 'pedagogy-prof-psychology', name: 'Педагогика и психология в профессиональной деятельности', examType: 'GENERAL', subjectKey: 'pedagogy_prof_psychology' },
  { id: 'speech-therapy', name: 'Дефектологическое образование: учитель-логопед', examType: 'GENERAL', subjectKey: 'speech_therapy' },
  { id: 'org-management', name: 'Менеджмент организации', examType: 'GENERAL', subjectKey: 'org_management' },
  { id: 'econ-management', name: 'Экономика и менеджмент', examType: 'GENERAL', subjectKey: 'econ_management' },
  { id: 'hr-management', name: 'Управление персоналом (кадровый менеджмент)', examType: 'GENERAL', subjectKey: 'hr_management' },
  { id: 'marketing-management', name: 'Менеджмент и маркетинг', examType: 'GENERAL', subjectKey: 'marketing_management' },
  { id: 'fitness-coach', name: 'Тренер по фитнесу', examType: 'GENERAL', subjectKey: 'fitness_coach' },
  { id: 'sport', name: 'Физическая культура и спорт', examType: 'GENERAL', subjectKey: 'sport' },
  { id: 'adaptive-sport', name: 'Адаптивная физическая культура', examType: 'GENERAL', subjectKey: 'adaptive_sport' },
  { id: 'pedagogy-theory', name: 'Педагогическое образование. Теория и методика обучения и воспитания', examType: 'GENERAL', subjectKey: 'pedagogy_theory' },
]

const getDynamicDirections = () => {
  try {
    const courses = getCourses()
    const baseSubjectKeys = new Set(AVAILABLE_DIRECTIONS.map((d) => d.subjectKey))
    return Object.entries(courses)
      .filter(([code]) => !baseSubjectKeys.has(code))
      .map(([code, course]) => ({
        id: code,
        name: course.title || code,
        examType: 'GENERAL',
        subjectKey: code
      }))
  } catch {
    return []
  }
}

export const getDirectionsList = () => {
  const dynamic = getDynamicDirections()
  const all = [...AVAILABLE_DIRECTIONS]
  dynamic.forEach((d) => {
    if (!all.find((item) => item.id === d.id)) {
      all.push(d)
    }
  })
  return all
}

/**
 * Получить subjectKey по directionId
 */
export function getSubjectKeyByDirectionId(directionId) {
  const direction = getDirectionsList().find((d) => d.id === directionId)
  return direction?.subjectKey || null
}

/**
 * Получить direction по ID
 */
export function getDirectionById(directionId) {
  return getDirectionsList().find((d) => d.id === directionId) || null
}

/**
 * Получить направления пользователя с маппингом на предметы
 */
export function getUserDirectionsWithSubjects(userDirections = []) {
  return userDirections
    .map((id) => {
      const direction = getDirectionById(id)
      return direction
        ? {
        id: direction.id,
        name: direction.name,
        subjectKey: direction.subjectKey
          }
        : {
            id,
            name: id,
            subjectKey: id
          }
    })
    .filter(Boolean)
}

