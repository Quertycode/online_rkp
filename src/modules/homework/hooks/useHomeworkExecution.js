import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import {
  fetchHomework,
  fetchSubmission,
  saveStudentDraft,
  submitStudentHomework
} from '../services/homework.service'

export function useHomeworkExecution(id) {
  const [student] = useState(() => getCurrentUser())
  const [homework, setHomework] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    if (!id || !student?.username) return
    setLoading(true)
    try {
      setHomework(fetchHomework(id))
      setSubmission(fetchSubmission(id, student.username))
      setError('')
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить задание')
    } finally {
      setLoading(false)
    }
  }, [id, student?.username])

  useEffect(() => {
    load()
  }, [load])

  const saveDraftAnswers = useCallback(
    (answers) => {
      const result = saveStudentDraft(id, student.username, answers)
      setSubmission(result)
      return result
    },
    [id, student?.username]
  )

  const submitAnswers = useCallback(
    (answers) => {
      const result = submitStudentHomework(id, student.username, answers)
      setSubmission(result)
      return result
    },
    [id, student?.username]
  )

  return {
    student,
    homework,
    submission,
    loading,
    error,
    reload: load,
    saveDraftAnswers,
    submitAnswers
  }
}

