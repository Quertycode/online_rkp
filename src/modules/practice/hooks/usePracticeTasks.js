import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '@/utils/userStore'
import { getCourse, getCourses, getLessons, getTasks } from '@/utils/courseStore'

const STORAGE_PREFIX = 'practice_progress'
const PROGRESS_PREFIX = 'progress'

const loadPracticeProgress = (username) => {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${username}`)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

const savePracticeProgress = (username, set) => {
  if (typeof localStorage === 'undefined') return
  const value = JSON.stringify(Array.from(set))
  localStorage.setItem(`${STORAGE_PREFIX}_${username}`, value)
}

const loadLessonProgress = (username) => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(`${PROGRESS_PREFIX}_${username}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function usePracticeTasks() {
  const user = getCurrentUser()
  const username = user?.username || 'guest'

  const [selectedCourse, setSelectedCourse] = useState('')
  const [manualCompleted, setManualCompleted] = useState(() => loadPracticeProgress(username))
  const [lessonProgress] = useState(() => loadLessonProgress(username))

  const courses = useMemo(() => getCourses(), [])
  const tasks = useMemo(() => getTasks(), [])

  const accessibleCourseIds = useMemo(() => {
    const access = user?.access || {}
    return Object.entries(access)
      .filter(([, value]) => Boolean(value?.enabled))
      .map(([code]) => code)
      .filter((code) => Boolean(courses[code]))
  }, [user?.access, courses])

  useEffect(() => {
    if (!selectedCourse || !accessibleCourseIds.includes(selectedCourse)) {
      setSelectedCourse(accessibleCourseIds[0] || '')
    }
  }, [accessibleCourseIds, selectedCourse])

  useEffect(() => {
    setManualCompleted(loadPracticeProgress(username))
  }, [username])

  const courseLessons = useMemo(() => {
    if (!selectedCourse) return []
    return getLessons(selectedCourse) || []
  }, [selectedCourse])

  const lessonsMap = useMemo(() => {
    const map = new Map()
    courseLessons.forEach((lesson) => {
      map.set(String(lesson.id), lesson)
    })
    return map
  }, [courseLessons])

  const courseTasks = useMemo(() => {
    if (!selectedCourse) return []
    return tasks
      .filter((task) => task.subject === selectedCourse)
      .map((task) => {
        const computedTaskType =
          task.taskType ||
          (task.subject === 'pract_psychology' && Number(task.id) % 2 === 0 ? 'assignment' : 'test')
        const lesson = lessonsMap.get(String(task.lessonId)) || null
        const lessonKey = `${selectedCourse}_${task.lessonId}`
        const lessonDone = Boolean(lessonProgress[lessonKey]?.completed)
        return {
          ...task,
          taskType: computedTaskType,
          lessonTitle: lesson?.title || 'Занятие',
          lessonOrder: lesson?.order ?? Number.MAX_SAFE_INTEGER,
          lessonKey,
          syncedCompleted: lessonDone,
        }
      })
      .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0))
  }, [tasks, selectedCourse, lessonsMap, lessonProgress])

  const effectiveCompleted = useMemo(() => {
    const set = new Set(manualCompleted)
    courseTasks.forEach((task) => {
      if (task.syncedCompleted) set.add(String(task.id))
    })
    return set
  }, [manualCompleted, courseTasks])

  const stats = useMemo(() => {
    const total = courseTasks.length
    const completedCount = courseTasks.filter((t) => effectiveCompleted.has(String(t.id))).length
    return { total, completed: completedCount }
  }, [courseTasks, effectiveCompleted])

  const setTaskCompletion = (task, value) => {
    const id = String(task.id)

    const nextManual = new Set(manualCompleted)
    if (value) nextManual.add(id)
    else nextManual.delete(id)
    setManualCompleted(nextManual)
    savePracticeProgress(username, nextManual)
  }

  const markCompleted = (task) => setTaskCompletion(task, true)
  const markNotCompleted = (task) => setTaskCompletion(task, false)

  const courseTitle = selectedCourse ? getCourse(selectedCourse)?.title || selectedCourse : ''

  return {
    user,
    courses,
    accessibleCourseIds,
    selectedCourse,
    setSelectedCourse,
    tasks: courseTasks,
    stats,
    courseTitle,
    completed: effectiveCompleted,
    markCompleted,
    markNotCompleted,
  }
}


