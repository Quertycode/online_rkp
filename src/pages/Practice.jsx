import PracticeHeader from '@modules/practice/components/PracticeHeader'
import PracticeTaskList from '@modules/practice/components/PracticeTaskList'
import { usePracticeTasks } from '@modules/practice/hooks/usePracticeTasks'
import { getSubjectName } from '@/constants/subjects'

export default function Practice() {
  const {
    user,
    courses,
    accessibleCourseIds,
    selectedCourse,
    setSelectedCourse,
    tasks,
    stats,
    completed,
    markCompleted,
    markNotCompleted,
  } = usePracticeTasks()

  if (!user) {
    return (
      <div className='w-full max-w-[1600px] mx-auto px-6 py-8'>
        <div className='rounded-2xl border border-cyan-100 bg-white p-6 text-center text-gray-700'>
          Авторизуйтесь, чтобы увидеть практические задания.
        </div>
      </div>
    )
  }

  if (!accessibleCourseIds.length) {
    return (
      <div className='w-full max-w-[1600px] mx-auto px-6 py-8'>
        <div className='rounded-2xl border border-cyan-100 bg-white p-6 text-center text-gray-700'>
          Нет доступных курсов. Обратитесь к администратору.
        </div>
      </div>
    )
  }

  const courseOptions = accessibleCourseIds.map((code) => ({
    code,
    title: courses[code]?.title || getSubjectName(code),
  }))

  return (
    <div className='w-full max-w-[1600px] mx-auto px-6 py-8 space-y-6'>
      <PracticeHeader
        courseTitle={courseOptions.find((c) => c.code === selectedCourse)?.title || ''}
        stats={stats}
        courseOptions={courseOptions}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
      />

      <PracticeTaskList
        tasks={tasks}
        subject={selectedCourse}
        completedSet={completed}
        onComplete={markCompleted}
        onReset={markNotCompleted}
      />
    </div>
  )
}
