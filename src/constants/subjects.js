import { getCourses } from '../utils/courseStore'

/**
 * Централизованный маппинг всех предметов платформы (базовые).
 * Динамические курсы из courseStore подмешиваются в getAllSubjects/getSubjectName.
 */

export const SUBJECTS = {
  pract_psychology: 'Практическая психология',
  pedagogy_prof_psychology: 'Педагогика и психология в профессиональной деятельности',
  speech_therapy: 'Дефектологическое образование: учитель-логопед',
  org_management: 'Менеджмент организации',
  econ_management: 'Экономика и менеджмент',
  hr_management: 'Управление персоналом (кадровый менеджмент)',
  marketing_management: 'Менеджмент и маркетинг',
  fitness_coach: 'Тренер по фитнесу',
  sport: 'Физическая культура и спорт',
  adaptive_sport: 'Адаптивная физическая культура',
  pedagogy_theory: 'Педагогическое образование. Теория и методика обучения и воспитания',
}

const getDynamicCourses = () => {
  try {
    const data = getCourses?.() || {}
    return data
  } catch {
    return {}
  }
}

/**
 * Определить тип экзамена на основе класса пользователя
 * @param {number|null} grade - Класс пользователя
 * @returns {'oge'|'ege'} Тип экзамена
 */
export function getExamType(grade) {
  if (!grade) return 'ege'
  return grade >= 9 ? 'ege' : 'oge'
}

/**
 * Получить название предмета по коду
 */
export function getSubjectName(code) {
  const dynamic = getDynamicCourses()
  return SUBJECTS[code] || dynamic?.[code]?.title || code
}

/**
 * Получить все предметы в виде массива
 */
export function getAllSubjects() {
  const base = Object.entries(SUBJECTS).map(([code, name]) => ({
    code,
    name,
  }))
  const dynamic = getDynamicCourses()
  Object.entries(dynamic).forEach(([code, course]) => {
    if (!base.find((s) => s.code === code)) {
      base.push({ code, name: course.title || code })
    }
  })
  return base
}

/**
 * Маппинг кодов предметов на коды БД с учетом типа экзамена
 * @param {string} subjectCode - Код предмета (math, rus, bio и т.д.)
 * @param {'oge'|'ege'} examType - Тип экзамена
 * @returns {string} Код БД
 */
export function getSubjectDbCode(subjectCode, examType = 'oge') {
  return subjectCode
}

/**
 * Обратный маппинг: код БД -> код предмета
 */
export const DB_SUBJECT_MAP = Object.keys(SUBJECTS).reduce((acc, key) => {
  acc[key] = key
  return acc
}, {})

