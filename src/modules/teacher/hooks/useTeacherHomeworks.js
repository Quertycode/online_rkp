import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import {
  createTeacherHomework,
  deleteTeacherHomework,
  fetchAvailableCourses,
  fetchHomeworkSubmissions,
  fetchTeacherHomeworks,
  fetchTeacherStudents,
  sendFeedback,
  notifyStudents
} from '../services/teacher.service'
import { useToast } from '../../../components/ToastContainer'

export function useTeacherHomeworks() {
  const [teacher] = useState(() => getCurrentUser())
  const [homeworks, setHomeworks] = useState([])
  const [courses, setCourses] = useState([])
  const [studentCount, setStudentCount] = useState(0)
  const [submissionMap, setSubmissionMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const load = useCallback(() => {
    setLoading(true)
    try {
      const teacherHomeworks = fetchTeacherHomeworks()
      const submissions = {}
      teacherHomeworks.forEach((hw) => {
        submissions[hw.id] = fetchHomeworkSubmissions(hw.id)
      })
      setHomeworks(teacherHomeworks)
      setSubmissionMap(submissions)
      const teacherStudents = fetchTeacherStudents()
      setCourses(fetchAvailableCourses(teacher?.access || {}))
      setStudentCount(teacherStudents.length)
      setError('')
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить задания')
    } finally {
      setLoading(false)
    }
  }, [teacher?.access])

  useEffect(() => {
    load()
  }, [load])

  const createHomework = useCallback((payload) => {
    const created = createTeacherHomework(payload)
    setHomeworks((prev) => [...prev, created])
    setSubmissionMap((prev) => ({ ...prev, [created.id]: [] }))
    const recipients = payload.assignAll
      ? fetchTeacherStudents().map((s) => s.id)
      : payload.assigneeIds
    if (recipients?.length) {
      notifyStudents(recipients, {
        text: `Вам назначено задание "${payload.title}"`,
        link: `/homework/${created.id}`
      })
    }
    toast.showToast('Задание создано', 'success')
    return created
  }, [toast])

  const removeHomework = useCallback((homeworkId) => {
    deleteTeacherHomework(homeworkId)
    setHomeworks((prev) => prev.filter((hw) => hw.id !== homeworkId))
    setSubmissionMap((prev) => {
      const next = { ...prev }
      delete next[homeworkId]
      return next
    })
    toast.showToast('Задание удалено', 'success')
  }, [toast])

  const stats = useMemo(
    () =>
      homeworks.reduce((acc, hw) => {
        const submissions = submissionMap[hw.id] || []
        const assigned = hw.assignAll ? studentCount : hw.assigneeIds.length
        const submitted = submissions.filter((s) => s.status !== 'draft').length
        const graded = submissions.filter((s) => s.status === 'graded').length
        acc[hw.id] = {
          assigned,
          submitted,
          graded,
          pending: Math.max(assigned - submitted, 0)
        }
        return acc
      }, {}),
    [homeworks, submissionMap, studentCount]
  )

  const provideFeedback = useCallback((homeworkId, studentId, feedback) => {
    const updated = sendFeedback(homeworkId, studentId, feedback)
    if (updated) {
      setSubmissionMap((prev) => ({
        ...prev,
        [homeworkId]: (prev[homeworkId] || [])
          .filter((s) => !(s.homeworkId === homeworkId && s.studentId === studentId))
          .concat(updated)
      }))
      toast.showToast('Комментарий отправлен', 'success')
    }
    return updated
  }, [toast])

  return {
    teacher,
    homeworks,
    courses,
    loading,
    error,
    stats,
    reload: load,
    createHomework,
    removeHomework,
    studentCount,
    submissionMap,
    provideFeedback
  }
}

