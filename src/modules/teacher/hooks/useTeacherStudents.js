import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../../../utils/userStore'
import {
  attachStudent,
  detachStudent,
  fetchStudents,
  fetchTeacherStudents
} from '../services/teacher.service'

export function useTeacherStudents() {
  const [teacher] = useState(() => getCurrentUser())
  const [allStudents, setAllStudents] = useState([])
  const [linkedStudents, setLinkedStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    try {
      setAllStudents(fetchStudents(teacher?.access || {}))
      setLinkedStudents(fetchTeacherStudents())
      setError('')
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить студентов')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addStudent = useCallback((payload) => {
    setLoading(true)
    try {
      const created = attachStudent(payload)
      setLinkedStudents(fetchTeacherStudents())
      setAllStudents(fetchStudents())
      return created
    } finally {
      setLoading(false)
    }
  }, [])

  const removeStudent = useCallback((studentId) => {
    setLoading(true)
    try {
      detachStudent(studentId)
      setLinkedStudents(fetchTeacherStudents())
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    teacher,
    allStudents,
    linkedStudents,
    loading,
    error,
    reloadStudents: load,
    addStudent,
    removeStudent
  }
}

