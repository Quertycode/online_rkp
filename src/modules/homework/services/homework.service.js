import {
  getHomeworkById,
  getSubmission,
  listStudentHomeworks,
  saveDraft,
  submitHomework
} from './mockApi'

export const fetchStudentHomeworks = (studentId) => listStudentHomeworks(studentId)

export const fetchHomework = (id) => getHomeworkById(id)

export const fetchSubmission = (homeworkId, studentId) => getSubmission(homeworkId, studentId)

export const saveStudentDraft = (homeworkId, studentId, answers) =>
  saveDraft(homeworkId, studentId, answers)

export const submitStudentHomework = (homeworkId, studentId, answers) =>
  submitHomework(homeworkId, studentId, answers)

