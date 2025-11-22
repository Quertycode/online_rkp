import { createContext, useContext, useState, useCallback } from 'react'
import Toast from './Toast'

const ToastContext = createContext()

/**
 * Provider для управления Toast уведомлениями
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])
  
  const value = {
    showToast,
    removeToast
  }
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Контейнер для Toast уведомлений */}
      <div className='fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none'>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className='pointer-events-auto animate-[slideInRight_0.3s_ease-out]'
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Хук для использования Toast уведомлений
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

