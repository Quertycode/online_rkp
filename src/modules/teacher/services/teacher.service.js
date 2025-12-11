import { addNotification, getCurrentUser, getUsers, getUserFull } from '../../../utils/userStore'
import {
  addStudentToTeacher,
  createHomework,
  deleteHomework,
  listCourses,
  listStudents,
  listStudentHomeworks,
  listSubmissionsByHomework,
  listSubmissionsByStudent,
  listTeacherHomeworks,
  listTeacherStudents,
  removeStudentFromTeacher,
  addFeedback,
  getHomeworkById
} from '../../homework/services/mockApi'
import { getSubjectName } from '../../../constants/subjects'
import { getCourse, getCourses } from '../../../utils/courseStore'

const getTeacherId = () => getCurrentUser()?.username || 'teacher@example.com'
const normalizeId = (value) => (value || '').trim().toLowerCase()

export const fetchAvailableCourses = (access) => listCourses(access)

export const fetchStudents = (teacherAccess = {}) => {
  const users = getUsers().filter((u) => u.role === 'student')
  const accessCodes = Object.keys(teacherAccess || {}).filter((code) => teacherAccess[code]?.enabled)
  const eligible = users.filter((u) => accessCodes.some((code) => u.access?.[code]?.enabled))
  const stored = listStudents()

  const eligibleIds = new Set(eligible.map((u) => u.username))
  const eligibleEmails = new Set(eligible.map((u) => u.email?.toLowerCase()))

  const filteredStored = stored.filter(
    (s) => eligibleIds.has(s.id) || eligibleEmails.has(s.email?.toLowerCase())
  )

  const merged = [...filteredStored]
  eligible.forEach((u) => {
    if (!merged.find((s) => s.id === u.username)) {
      merged.push({ id: u.username, name: `${u.firstName} ${u.lastName}`.trim() || u.username, email: u.email })
    }
  })

  // fallback: если нет ни одного eligible, но есть сохраненные студенты (моки), показываем их
  if (merged.length === 0 && stored.length > 0 && eligible.length === 0) {
    return stored
  }

  return merged
}

export const fetchTeacherStudents = () => listTeacherStudents(getTeacherId())

export const attachStudent = (student) => addStudentToTeacher(getTeacherId(), student)

export const detachStudent = (studentId) => removeStudentFromTeacher(getTeacherId(), studentId)

export const fetchTeacherHomeworks = () => listTeacherHomeworks(getTeacherId())

export const createTeacherHomework = (payload) => createHomework(getTeacherId(), payload)

export const deleteTeacherHomework = (homeworkId) => deleteHomework(getTeacherId(), homeworkId)

export const fetchHomeworkSubmissions = (homeworkId) => listSubmissionsByHomework(homeworkId)

export const fetchStudentHomeworks = (studentId) => listStudentHomeworks(studentId)

const loadJson = (key, fallback = {}) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const allSubjects = () => Object.keys(getCourses() || {})

const getAllowedSubjects = (teacherAccess = {}, studentAccess = {}) => {
  const teacherAllowed = Object.entries(teacherAccess || {})
    .filter(([, cfg]) => cfg?.enabled)
    .map(([code]) => code)
  const studentAllowed = Object.entries(studentAccess || {})
    .filter(([, cfg]) => cfg?.enabled)
    .map(([code]) => code)

  const teacherPool = teacherAllowed.length ? teacherAllowed : allSubjects()
  const studentPool = studentAllowed.length ? studentAllowed : allSubjects()

  return teacherPool.filter((code) => studentPool.includes(code))
}

export const fetchStudentLessonProgress = (studentId, teacherAccess = {}) => {
  if (!studentId) return []
  const normalizedId = normalizeId(studentId)
  const student = getUserFull(normalizedId) || getUserFull(studentId)
  const allowedSubjects = getAllowedSubjects(teacherAccess, student?.access || {})
  const progress = loadJson(`progress_${normalizedId || studentId}`, {})
  return Object.entries(progress)
    .map(([key, value]) => {
      const parts = key.split('_')
      const lessonId = parts.pop()
      const subject = parts.join('_')
      if (!allowedSubjects.includes(subject)) return null
      const course = getCourse(subject)
      const lesson = course?.lessons?.find((l) => String(l.id) === String(lessonId))
      return {
        subject,
        subjectTitle: course?.title || getSubjectName(subject),
        lessonId,
        lessonTitle: lesson?.title || `Урок ${lessonId}`,
        watched: Boolean(value?.watched),
        completed: Boolean(value?.completed)
      }
    })
    .filter(Boolean)
}

export const fetchStudentHomeworkSubmissions = (studentId, teacherAccess = {}) => {
  if (!studentId) return []
  const normalizedId = normalizeId(studentId)
  const student = getUserFull(normalizedId) || getUserFull(studentId)
  const allowedSubjects = getAllowedSubjects(teacherAccess, student?.access || {})

  return listSubmissionsByStudent(normalizedId || studentId)
    .map((item) => ({
      ...item,
      status: item.status || 'draft'
    }))
    .filter((item) => {
      const hw = getHomeworkById(item.homeworkId)
      if (!hw) return false
      return allowedSubjects.includes(hw.courseId)
    })
}

export const notifyStudents = (studentIds, notification) => {
  studentIds.forEach((id) =>
    addNotification(id, {
      emoji: '📥',
      ...(typeof notification === 'string' ? { text: notification } : notification)
    })
  )
}

export const sendFeedback = (homeworkId, studentId, feedback) => addFeedback(homeworkId, studentId, feedback)

