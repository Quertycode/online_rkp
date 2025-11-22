import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { PomodoroProvider } from './contexts/PomodoroContext'
import { ToastProvider } from './components/ToastContainer'
import Header from './components/Header'
import BackButton from './components/BackButton'
import ProtectedRoute from './components/ProtectedRoute'
import { getCurrentUser } from './utils/userStore'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseLessons from './pages/CourseLessons'
import LessonDetails from './pages/LessonDetails'
import Trainer from './pages/Trainer'
import Tasks from './pages/Tasks'
import Homework from './pages/Homework'
import Account from './pages/Account'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import TeacherPanel from './pages/TeacherPanel'
import KnowledgeBase from './pages/KnowledgeBase'
import Gamification from './pages/Gamification'
import PomodoroTimer from './pages/PomodoroTimer'
import NotFound from './pages/NotFound'

export default function App() {
  const basename = import.meta.env.BASE_URL || '/'

  return (
    <ThemeProvider>
      <PomodoroProvider>
      <ToastProvider>
      <BrowserRouter 
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
      <div className='min-h-screen bg-gradient-to-b from-cyan-50 to-white text-gray-800 flex flex-col'>
        <Header />
        <BackButton />
        <main className='flex-1 flex flex-col min-h-0'>
          <div className='w-full max-w-[1600px] mx-auto px-4 md:px-6 h-full flex-1 flex flex-col min-h-0'>
            <div className='flex-1 min-h-0'>
              <Routes>
              <Route 
                path='/' 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route path='/login' element={<div className='p-4 md:p-6'><Login /></div>} />
              <Route 
                path='/trainer' 
                element={
                  <ProtectedRoute>
                    <Trainer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/tasks' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><Tasks /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/homework' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><Homework /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/account' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><Account /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/gamification' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><Gamification /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/pomodoro' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><PomodoroTimer /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/courses' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><Courses /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/knowledge-base/:subject' 
                element={
                  <ProtectedRoute>
                    <div className='p-4 md:p-6'><KnowledgeBase /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/courses/:subject' 
                element={
                  <ProtectedRoute roles={['student', 'teacher', 'admin']}>
                    <div className='p-4 md:p-6'><CourseLessons /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/courses/:subject/:lessonId' 
                element={
                  <ProtectedRoute roles={['student', 'teacher', 'admin']}>
                    <div className='p-4 md:p-6'><LessonDetails /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/teacher-panel' 
                element={
                  <ProtectedRoute roles={['teacher']}>
                    <div className='p-4 md:p-6'><TeacherPanel /></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/admin' 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <div className='p-4 md:p-6'><AdminPanel /></div>
                  </ProtectedRoute>
                } 
              />
              <Route path='/404' element={<div className='p-4 md:p-6'><NotFound /></div>} />
              <Route path='*' element={<Navigate to='/404' replace />} />
              </Routes>
            </div>
          </div>
        </main>
        <footer className='text-center py-6 text-cyan-700/80 text-sm border-t border-cyan-100'>
          <div className='w-full max-w-[1600px] mx-auto px-4 md:px-6'>
            © {new Date().getFullYear()} Эврика!
          </div>
        </footer>
      </div>
    </BrowserRouter>
    </ToastProvider>
    </PomodoroProvider>
    </ThemeProvider>
  )
}
