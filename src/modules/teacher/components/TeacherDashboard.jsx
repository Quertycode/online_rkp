import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import CreateHomeworkForm from './CreateHomeworkForm'
import HomeworkList from './HomeworkList'
import TeacherStudentsSection from './TeacherStudentsSection'
import TeacherSummaryPanel from './TeacherSummaryPanel'
import { useTeacherHomeworks } from '../hooks/useTeacherHomeworks'
import { useTeacherStudents } from '../hooks/useTeacherStudents'
import { useTeacherProgress } from '../hooks/useTeacherProgress'
import StudentProgressBoard from './StudentProgressBoard'

function OverlayPortal({ open, onClose, children, zIndex = 20000 }) {
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else if (visible) {
      setClosing(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open, visible])

  if (!visible) return null

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overlay-anim ${closing ? 'overlay-anim-exit' : ''}`}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`modal-anim ${closing ? 'modal-anim-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default function TeacherDashboard() {
  const { teacher, homeworks, courses, stats, createHomework, removeHomework, loading: hwLoading, reload, submissionMap, provideFeedback } = useTeacherHomeworks()
  const {
    linkedStudents,
    allStudents,
    addStudent,
    removeStudent,
    loading: studentsLoading,
    error: studentsError
  } = useTeacherStudents()
  const {
    progress,
    loading: progressLoading,
    reload: reloadProgress
  } = useTeacherProgress(linkedStudents, teacher?.access || {})
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [highlightId, setHighlightId] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [showArchive, setShowArchive] = useState(false)

  useEffect(() => {
    reload()
  }, [linkedStudents.length, reload])

  const handleSelectHomework = (homeworkId) => {
    setHighlightId(homeworkId)
    setShowAll(true)
    setTimeout(() => setHighlightId(null), 2000)
  }

  if (!teacher) {
    return (
      <div className='w-full max-w-[1280px] mx-auto px-6 py-6'>
        <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
          <h2 className='text-lg font-semibold text-red-700 mb-2'>Нет доступа</h2>
          <p className='text-sm text-red-700/80'>Авторизуйтесь как учитель, чтобы работать с заданиями.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-[1280px] mx-auto px-6 py-6 space-y-6'>
      <div className='flex items-start justify-between gap-4 flex-col md:flex-row'>
        <div>
          <p className='text-sm text-cyan-700/70'>Панель учителя</p>
          <h1 className='text-2xl font-semibold text-gray-900'>Домашние задания</h1>
        </div>
        <div className='flex items-center gap-3 self-start md:self-center'>
          <div className='text-sm text-gray-600'>Студентов: {linkedStudents.length}</div>
          <button
            type='button'
            onClick={() => setStudentsOpen(true)}
            className='rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
          >
            Управление студентами
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-start'>
        <div className='lg:col-span-2 space-y-4'>
          <CreateHomeworkForm
            courses={courses}
            students={linkedStudents}
            onCreate={createHomework}
            loading={hwLoading}
          />
        </div>
        <div className='lg:col-span-1 flex flex-col gap-4 self-start'>
          <TeacherSummaryPanel
            homeworks={homeworks}
            stats={stats}
            students={linkedStudents}
            onOpenStudents={() => setStudentsOpen(true)}
            onSelectHomework={handleSelectHomework}
            onShowAll={() => setShowAll(true)}
            onShowArchive={() => setShowArchive(true)}
          />
        </div>
      </div>

      <StudentProgressBoard
        students={linkedStudents}
        progress={progress}
        loading={progressLoading}
        onRefresh={reloadProgress}
      />

      <OverlayPortal open={showAll} onClose={() => setShowAll(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Все задания</h3>
              <p className='text-sm text-gray-600'>Полный список заданий и статусов</p>
            </div>
            <button
              type='button'
              onClick={() => setShowAll(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <HomeworkList
            homeworks={homeworks}
            stats={stats}
            loading={hwLoading}
            onDelete={removeHomework}
            students={linkedStudents}
            submissions={submissionMap}
            onFeedback={provideFeedback}
            highlightId={highlightId}
          />
        </div>
      </OverlayPortal>

      <OverlayPortal open={showArchive} onClose={() => setShowArchive(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Архив заданий</h3>
              <p className='text-sm text-gray-600'>Задания, выполненные всеми студентами</p>
            </div>
            <button
              type='button'
              onClick={() => setShowArchive(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <HomeworkList
            homeworks={homeworks.filter((hw) => {
              const stat = stats[hw.id] || {}
              return (stat.assigned || 0) > 0 && (stat.submitted || 0) >= (stat.assigned || 0)
            })}
            stats={stats}
            loading={hwLoading}
            onDelete={removeHomework}
            students={linkedStudents}
            submissions={submissionMap}
            onFeedback={provideFeedback}
            highlightId={highlightId}
          />
        </div>
      </OverlayPortal>

      <OverlayPortal open={studentsOpen} onClose={() => setStudentsOpen(false)}>
        <div className='bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Привязка студентов</h3>
              <p className='text-sm text-gray-600'>Доступны только студенты с доступом к вашим курсам</p>
            </div>
            <button
              type='button'
              onClick={() => setStudentsOpen(false)}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              Закрыть
            </button>
          </div>
          <TeacherStudentsSection
            students={linkedStudents}
            available={allStudents}
            onAdd={addStudent}
            onRemove={removeStudent}
            loading={studentsLoading}
            error={studentsError}
          />
        </div>
      </OverlayPortal>
    </div>
  )
}

