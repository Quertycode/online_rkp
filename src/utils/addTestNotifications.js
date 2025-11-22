import { addNotification } from './userStore'

/**
 * Создаёт тестовые уведомления для пользователя
 * @param {string} username - имя пользователя
 */
export function createTestNotifications(username) {
  if (!username) return

  // Проверяем, что уведомления ещё не были добавлены
  const timestamp = localStorage.getItem(`test_notifications_${username}`)
  const now = Date.now()
  
  // Если последние уведомления были добавлены больше 5 минут назад, добавляем новые
  if (!timestamp || (now - parseInt(timestamp)) > 300000) {
    addNotification(username, {
      text: 'Ваш прогресс по курсу обновлён',
      emoji: '✅'
    })
    
    addNotification(username, {
      text: 'Доступен новый модуль по теме «JavaScript»',
      emoji: '📘'
    })
    
    addNotification(username, {
      text: 'Преподаватель оставил комментарий к заданию',
      emoji: '💬'
    })

    // Сохраняем время добавления
    localStorage.setItem(`test_notifications_${username}`, now.toString())
  }
}

/**
 * Примеры других типов уведомлений для реального использования
 */

import { getSubjectName } from '../constants/subjects'

// Для успешного выполнения задания
export function notifyTaskCompleted(username, subject) {
  const subjectName = getSubjectName(subject) || subject
  addNotification(username, {
    text: `Отличная работа! Вы решили задание по ${subjectName}`,
    emoji: '🎉'
  })
}

// При открытии нового урока
export function notifyLessonUnlocked(username, lessonName) {
  addNotification(username, {
    text: `Доступен новый урок: "${lessonName}"`,
    emoji: '📚'
  })
}

// При достижении прогресса
export function notifyProgress(username, percentage) {
  addNotification(username, {
    text: `Ваш прогресс достиг ${percentage}%!`,
    emoji: '📈'
  })
}

// Когда преподаватель отвечает
export function notifyTeacherComment(username) {
  addNotification(username, {
    text: 'Преподаватель оставил комментарий к вашей работе',
    emoji: '💬'
  })
}

// Новый доступ к предмету (для админа)
export function notifyAccessGranted(username, subject) {
  const subjectName = getSubjectName(subject) || subject
  addNotification(username, {
    text: `Вам предоставлен доступ к ${subjectName}`,
    emoji: '🎓'
  })
}

