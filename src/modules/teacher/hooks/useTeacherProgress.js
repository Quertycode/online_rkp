import { useCallback, useEffect, useState } from 'react'
import {
  fetchStudentHomeworkSubmissions,
  fetchStudentLessonProgress
} from '../services/teacher.service'

/**
 * Загружает прогресс студентов по урокам (видео/практическим заданиям) для панели учителя
 */
export function useTeacherProgress(students = [], teacherAccess = {}) {
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    try {
      const map = {}
      students.forEach((student) => {
        const lessons = fetchStudentLessonProgress(student.id, teacherAccess)
        const submissions = fetchStudentHomeworkSubmissions(student.id, teacherAccess)
        map[student.id] = { lessons, submissions }
      })
      setProgress(map)
    } finally {
      setLoading(false)
    }
  }, [students, teacherAccess])

  useEffect(() => {
    load()
  }, [load])

  return {
    progress,
    loading,
    reload: load
  }
}


