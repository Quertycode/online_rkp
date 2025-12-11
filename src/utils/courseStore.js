import baseCourses from '../data/courses.json'
import baseTasks from '../data/tasks.json'

const STORAGE_KEY = 'edumvp_courses_state_v1'

const defaultState = { courses: {}, tasks: [] }

const safeParse = (raw, fallback) => {
  try {
    return JSON.parse(raw) ?? fallback
  } catch {
    return fallback
  }
}

const loadState = () => {
  if (typeof localStorage === 'undefined') return defaultState
  return safeParse(localStorage.getItem(STORAGE_KEY), defaultState)
}

const saveState = (state) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('edumvp_courses_updated'))
  }
}

const cloneBaseCourses = () => safeParse(JSON.stringify(baseCourses || {}), {})

const normalizeCourse = (course = {}) => {
  // Сортируем занятия, но не обрезаем — храним весь список
  const lessons = sortLessons(course.lessons || [])
  return { ...course, lessons }
}

const mergeCourses = (state) => {
  const merged = cloneBaseCourses()
  Object.entries(state.courses || {}).forEach(([code, course]) => {
    merged[code] = normalizeCourse(course)
  })
  // Также нормализуем базовые курсы (на случай, если в сторе лежат старые данные)
  Object.keys(merged).forEach((code) => {
    merged[code] = normalizeCourse(merged[code])
  })
  return merged
}

const mergeTasks = (state) => {
  const map = new Map()
  ;(baseTasks || []).forEach((task) => map.set(String(task.id), task))
  ;(state.tasks || []).forEach((task) => map.set(String(task.id), task))
  return Array.from(map.values())
}

const generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

const toNumber = (value, fallback) => {
  const num = Number(value)
  return Number.isNaN(num) ? fallback : num
}

const sortLessons = (lessons = []) =>
  [...lessons].sort((a, b) => {
    const aOrder = toNumber(a.order, Number.MAX_SAFE_INTEGER)
    const bOrder = toNumber(b.order, Number.MAX_SAFE_INTEGER)
    if (aOrder !== bOrder) return aOrder - bOrder
    const aId = toNumber(a.id, Number.MAX_SAFE_INTEGER)
    const bId = toNumber(b.id, Number.MAX_SAFE_INTEGER)
    return aId - bId
  })

const persistCourse = (courseId, course, state) => {
  const nextState = { ...state, courses: { ...(state.courses || {}), [courseId]: course } }
  saveState(nextState)
  return course
}

const persistState = (state) => {
  saveState(state)
  return state
}

export const getCourses = () => mergeCourses(loadState())

export const getCourse = (courseId) => {
  const merged = getCourses()
  const course = merged[courseId]
  if (!course) return null
  return { ...course, lessons: sortLessons(course.lessons || []) }
}

export const getLessons = (courseId) => getCourse(courseId)?.lessons || []

export const getLesson = (courseId, lessonId) =>
  getLessons(courseId).find((lesson) => String(lesson.id) === String(lessonId)) || null

export const upsertCourse = ({ id, title, description = '', lessons = [] }) => {
  if (!id) return null
  const state = loadState()
  const normalizedId = String(id).trim()
  const current = mergeCourses(state)[normalizedId] || { lessons: [] }
  const nextCourse = {
    ...current,
    title: title?.trim() || current.title || 'Новый курс',
    description: description || current.description || '',
    lessons: sortLessons(lessons.length ? lessons : current.lessons || [])
  }
  return persistCourse(normalizedId, nextCourse, state)
}

export const removeCourse = (courseId) => {
  if (!courseId) return null
  const state = loadState()
  const nextCourses = { ...(state.courses || {}) }
  delete nextCourses[courseId]
  const nextState = { ...state, courses: nextCourses }
  persistState(nextState)
  return true
}

export const upsertLesson = (courseId, lessonInput) => {
  if (!courseId) return null
  const state = loadState()
  const merged = mergeCourses(state)
  const course = merged[courseId] || { title: 'Новый курс', lessons: [] }
  const lessons = [...(course.lessons || [])]
  const idx = lessonInput?.id
    ? lessons.findIndex((l) => String(l.id) === String(lessonInput.id))
    : -1

  const nextLesson = {
    id: lessonInput?.id || generateId('lesson'),
    title: lessonInput?.title?.trim() || 'Новое занятие',
    description: lessonInput?.description || '',
    teacher: lessonInput?.teacher || '',
    teacherName: lessonInput?.teacherName || '',
    video: lessonInput?.video || '',
    materials: lessonInput?.materials || [],
    homework: lessonInput?.homework || (idx >= 0 ? lessons[idx].homework || [] : []),
    order:
      lessonInput?.order === 0
        ? 0
        : toNumber(lessonInput?.order, lessons.length + 1)
  }

  if (idx >= 0) {
    lessons[idx] = { ...lessons[idx], ...nextLesson }
  } else {
    lessons.push(nextLesson)
  }

  const updatedCourse = { ...course, lessons: sortLessons(lessons) }
  persistCourse(courseId, updatedCourse, state)
  return nextLesson
}

export const removeLesson = (courseId, lessonId) => {
  if (!courseId || !lessonId) return null
  const state = loadState()
  const merged = mergeCourses(state)
  const course = merged[courseId]
  if (!course) return null
  const lessons = (course.lessons || []).filter((l) => String(l.id) !== String(lessonId))
  const updated = { ...course, lessons }
  return persistCourse(courseId, updated, state)
}

export const getTasks = () => mergeTasks(loadState())

export const getTask = (taskId) => getTasks().find((t) => String(t.id) === String(taskId)) || null

export const upsertTask = (taskInput) => {
  const state = loadState()
  const tasks = mergeTasks(state)
  const id = taskInput?.id || generateId('task')
  const idx = tasks.findIndex((t) => String(t.id) === String(id))

  const nextTask = {
    ...tasks[idx] || {},
    id,
    subject: taskInput?.subject || tasks[idx]?.subject || '',
    lessonId: taskInput?.lessonId || tasks[idx]?.lessonId || null,
    question: taskInput?.question?.trim() || tasks[idx]?.question || 'Новое задание',
    answer: (taskInput?.answer || tasks[idx]?.answer || [])
      .map((value) => (typeof value === 'string' ? value.trim() : value))
      .filter(Boolean),
    type: taskInput?.type || tasks[idx]?.type || 'text'
  }

  if (idx >= 0) {
    tasks[idx] = nextTask
  } else {
    tasks.push(nextTask)
  }

  const baseIds = new Set((baseTasks || []).map((t) => String(t.id)))
  const customTasks = tasks.filter((t) => !baseIds.has(String(t.id)) || String(t.id) === String(id))
  saveState({ ...state, tasks: customTasks })
  return nextTask
}

export const attachTaskToLesson = (courseId, lessonId, taskId) => {
  if (!courseId || !lessonId || !taskId) return null
  const state = loadState()
  const merged = mergeCourses(state)
  const course = merged[courseId]
  if (!course) return null
  const lessons = [...(course.lessons || [])]
  const idx = lessons.findIndex((l) => String(l.id) === String(lessonId))
  if (idx < 0) return null
  const homework = Array.from(new Set([...(lessons[idx].homework || []), taskId]))
  lessons[idx] = { ...lessons[idx], homework }
  const updatedCourse = { ...course, lessons }
  return persistCourse(courseId, updatedCourse, state)
}

export const detachTaskFromLesson = (courseId, lessonId, taskId) => {
  if (!courseId || !lessonId || !taskId) return null
  const state = loadState()
  const merged = mergeCourses(state)
  const course = merged[courseId]
  if (!course) return null
  const lessons = [...(course.lessons || [])]
  const idx = lessons.findIndex((l) => String(l.id) === String(lessonId))
  if (idx < 0) return null
  const homework = (lessons[idx].homework || []).filter((id) => String(id) !== String(taskId))
  lessons[idx] = { ...lessons[idx], homework }
  const updatedCourse = { ...course, lessons }
  return persistCourse(courseId, updatedCourse, state)
}

export const getLessonTasks = (courseId, lessonId) => {
  const lesson = getLesson(courseId, lessonId)
  if (!lesson) return []
  const tasks = getTasks()
  const homeworkIds = new Set((lesson.homework || []).map((id) => String(id)))
  return tasks.filter((task) => homeworkIds.has(String(task.id)))
}

export { STORAGE_KEY as COURSE_STORAGE_KEY }

