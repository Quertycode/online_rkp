import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import { fetchStudentHomeworks, fetchSubmission } from '../services/homework.service'

export function useStudentHomeworks() {
  const [student, setStudent] = useState(() => getCurrentUser())
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState({})

  const load = useCallback(() => {
    if (!student?.username) return
    setLoading(true)
    try {
      const list = fetchStudentHomeworks(student.username)
      const submissionMap = {}
      list.forEach((hw) => {
        submissionMap[hw.id] = fetchSubmission(hw.id, student.username)
      })
      setItems(list)
      setSubmissions(submissionMap)
      setError('')
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить задания')
    } finally {
      setLoading(false)
    }
  }, [student?.username])

  useEffect(() => {
    setStudent(getCurrentUser())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    student,
    items,
    submissions,
    loading,
    error,
    reload: load
  }
}

