import { addNotification, getCurrentUser } from '../../../utils/userStore'
import { getSubjectName } from '../../../constants/subjects'
import { getCourses } from '../../../utils/courseStore'

const STORAGE_KEY = 'edumvp_homework_mock_state_v1'

const createId = (prefix) => {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${uuid}`
}

const defaultState = {
  students: [
    { id: 'anna@example.com', name: 'Анна Иванова', email: 'anna@example.com' },
    { id: 'ivan@example.com', name: 'Иван Петров', email: 'ivan@example.com' }
  ],
  teacherStudents: {},
  homeworks: [],
  submissions: []
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

const ensureTeacher = (teacherId) => teacherId || getCurrentUser()?.username || 'teacher@example.com'

const getNotifyState = () => {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY}_notify`) || '{}')
  } catch {
    return {}
  }
}

const saveNotifyState = (state) =>
  localStorage.setItem(`${STORAGE_KEY}_notify`, JSON.stringify(state))

export const listCourses = (access = {}) =>
  Object.entries(getCourses())
    .filter(([code]) => access?.[code]?.enabled)
    .map(([code, course]) => ({
      id: code,
      title: course.title || getSubjectName(code)
    }))

export function listStudents() {
  const state = loadState()
  return state.students
}

export function listTeacherStudents(teacherId) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  const ids = state.teacherStudents[key] || []
  return state.students.filter((s) => ids.includes(s.id))
}

export function addStudentToTeacher(teacherId, student) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  const email = student.email.trim().toLowerCase()
  const exists = state.students.find(
    (s) => s.email.toLowerCase() === email
  )
  const studentId = exists?.id || email || createId('student')
  const normalized = {
    id: studentId,
    name: student.name.trim(),
    email
  }
  if (!exists) state.students.push(normalized)
  state.teacherStudents[key] = Array.from(new Set([...(state.teacherStudents[key] || []), studentId]))
  saveState(state)
  return normalized
}

export function removeStudentFromTeacher(teacherId, studentId) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  state.teacherStudents[key] = (state.teacherStudents[key] || []).filter((id) => id !== studentId)
  saveState(state)
  return state.teacherStudents[key]
}

export function listTeacherHomeworks(teacherId) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  return state.homeworks.filter((hw) => hw.createdBy === key)
}

export function createHomework(teacherId, payload) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  const homework = {
    id: createId('hw'),
    createdBy: key,
    createdAt: new Date().toISOString(),
    title: payload.title,
    type: payload.type,
    courseId: payload.courseId,
    dueDate: payload.dueDate,
    assignAll: payload.assignAll,
    assigneeIds: payload.assigneeIds || [],
    content: payload.content || '',
    material: payload.material || '',
    questions: payload.questions || []
  }
  state.homeworks.push(homework)
  saveState(state)
  return homework
}

export function deleteHomework(teacherId, homeworkId) {
  const state = loadState()
  const key = ensureTeacher(teacherId)
  state.homeworks = state.homeworks.filter((hw) => !(hw.id === homeworkId && hw.createdBy === key))
  state.submissions = state.submissions.filter((s) => s.homeworkId !== homeworkId)
  saveState(state)
  return true
}

export function listStudentHomeworks(studentId) {
  const state = loadState()
  const notifyState = getNotifyState()
  const items = state.homeworks.filter((hw) => hw.assignAll || hw.assigneeIds.includes(studentId))

  const now = new Date()
  const overdueIds = notifyState.overdue || {}

  items.forEach((hw) => {
    const due = new Date(hw.dueDate)
    const isOverdue = due < now
    if (isOverdue && !overdueIds[hw.id]) {
      addNotification(studentId, { text: `Задание "${hw.title}" просрочено`, emoji: '⏰' })
      overdueIds[hw.id] = true
    }
  })

  notifyState.overdue = overdueIds
  saveNotifyState(notifyState)
  return items
}

export function getHomeworkById(id) {
  const state = loadState()
  return state.homeworks.find((hw) => hw.id === id) || null
}

export function getSubmission(homeworkId, studentId) {
  const state = loadState()
  return state.submissions.find(
    (item) => item.homeworkId === homeworkId && item.studentId === studentId
  ) || null
}

const upsertSubmission = (updater) => {
  const state = loadState()
  const next = updater(state)
  saveState(next)
  return next
}

export function saveDraft(homeworkId, studentId, answers) {
  const state = loadState()
  const existing = getSubmission(homeworkId, studentId)
  if (existing?.status === 'submitted' || existing?.status === 'graded') return existing
  const submission = {
    id: existing?.id || createId('sub'),
    homeworkId,
    studentId,
    status: 'draft',
    answers,
    submittedAt: null,
    grade: null,
    feedback: null
  }
  const next = {
    ...state,
    submissions: state.submissions.filter(
      (s) => !(s.homeworkId === homeworkId && s.studentId === studentId)
    ).concat(submission)
  }
  saveState(next)
  return submission
}

export function submitHomework(homeworkId, studentId, answers) {
  const state = loadState()
  const existing = getSubmission(homeworkId, studentId)
  if (existing?.status === 'submitted' || existing?.status === 'graded') return existing
  const hw = getHomeworkById(homeworkId)
  let grade = null
  if (hw?.questions?.length) {
    const total = hw.questions.length
    const correct = hw.questions.filter(
      (q) => (answers?.[q.id] || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()
    ).length
    grade = `${correct}/${total}`
  }
  const submission = {
    id: existing?.id || createId('sub'),
    homeworkId,
    studentId,
    status: 'submitted',
    answers,
    submittedAt: new Date().toISOString(),
    grade,
    feedback: null
  }
  const next = {
    ...state,
    submissions: state.submissions.filter(
      (s) => !(s.homeworkId === homeworkId && s.studentId === studentId)
    ).concat(submission)
  }
  saveState(next)
  return submission
}

export function listSubmissionsByHomework(homeworkId) {
  const state = loadState()
  return state.submissions.filter((s) => s.homeworkId === homeworkId)
}

export function listSubmissionsByStudent(studentId) {
  const state = loadState()
  return state.submissions.filter((s) => s.studentId === studentId)
}

export function addFeedback(homeworkId, studentId, feedback) {
  const state = loadState()
  const existing = getSubmission(homeworkId, studentId)
  if (!existing) return null
  const next = {
    ...existing,
    feedback,
    status: 'graded'
  }
  state.submissions = state.submissions
    .filter((s) => !(s.homeworkId === homeworkId && s.studentId === studentId))
    .concat(next)
  saveState(state)
  addNotification(studentId, { 
    text: `Новый комментарий по заданию "${getHomeworkById(homeworkId)?.title || ''}"`, 
    emoji: '💬',
    link: `/homework/${homeworkId}`
  })
  return next
}

