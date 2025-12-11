import { getAllSubjects } from '../constants/subjects'

const LS_USERS = 'edumvp_users'
const LS_CURRENT = 'edumvp_current_user'
const LS_STATS = 'edumvp_stats'
const LS_NOTIFICATIONS = 'edumvp_notifications'
const LS_LAST_COURSE_PREFIX = 'edumvp_last_course_'

const normalize = (value) => (value || '').trim()
const normalizeEmail = (value) => normalize(value).toLowerCase()

const ensureAccess = (access = {}) => {
  const subjects = getAllSubjects().map(s => s.code)
  const result = {}
  subjects.forEach(subject => {
    result[subject] = { enabled: Boolean(access[subject]?.enabled) }
  })
  return result
}

const ensureEmail = (value) => {
  const normalized = normalizeEmail(value)
  if (!normalized) return ''
  if (normalized.includes('@')) return normalized
  return `${normalized}@example.com`
}

const ensureUserStructure = (user) => {
  if (!user) return user
  const rawEmail = normalize(user.email) || normalize(user.username)
  const email = ensureEmail(rawEmail)
  
  return {
    ...user,
    username: normalize(user.username) || rawEmail || email,
    email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    birthdate: user.birthdate ?? '',
    phone: user.phone ?? '',
    avatar: user.avatar ?? '',
    access: ensureAccess(user.access),
    password: user.password ?? '',
    createdAt: user.createdAt || new Date().toISOString()
  }
}

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

/**
 * Вычислить текущий класс на основе даты создания аккаунта
 * Учебный год: 01.08 - 31.07
 */
export function initStore() {
  const existingUsers = load(LS_USERS, null)
  if (!existingUsers) {
    save(LS_USERS, [
      ensureUserStructure({
        username: 'admin@example.com',
        email: 'admin@example.com',
        password: 'admin',
        firstName: 'Системный',
        lastName: 'Администратор',
        role: 'admin',
        access: {
          pract_psychology: { enabled: true },
          pedagogy_prof_psychology: { enabled: true },
          speech_therapy: { enabled: true },
          org_management: { enabled: true },
          econ_management: { enabled: true },
          hr_management: { enabled: true },
          marketing_management: { enabled: true },
          fitness_coach: { enabled: true },
          sport: { enabled: true },
          adaptive_sport: { enabled: true },
          pedagogy_theory: { enabled: true },
        }
      })
    ])
  } else {
    const normalized = existingUsers.map(ensureUserStructure)
    save(LS_USERS, normalized)
  }
  if (!load(LS_STATS, null)) save(LS_STATS, {})
  if (!load(LS_NOTIFICATIONS, null)) save(LS_NOTIFICATIONS, {})
}

export const getUsers = () => load(LS_USERS, []).map(ensureUserStructure)
export const setUsers = (users) => save(LS_USERS, users.map(ensureUserStructure))
export const getCurrentUser = () => {
  const current = load(LS_CURRENT, null)
  if (!current) return null
  if (current.access) return current
  const full = getUsers().find((u) => normalizeEmail(u.username) === normalizeEmail(current.username))
  if (full) {
    const merged = { ...current, access: full.access }
    save(LS_CURRENT, merged)
    return merged
  }
  return current
}
export const setCurrentUser = (user) => save(LS_CURRENT, user)
export const logout = () => localStorage.removeItem(LS_CURRENT)

export function register(email, password, firstName, lastName, birthdate, phone) {
  const normalizedEmail = ensureEmail(email)
  if (!normalizedEmail) throw new Error('Укажите электронную почту')
  if (!normalize(email).includes('@')) throw new Error('Введите корректный адрес электронной почты')
  if (!normalize(password)) throw new Error('Введите пароль')
  if (!normalize(birthdate)) throw new Error('Укажите дату рождения')
  if (!normalize(phone)) throw new Error('Укажите номер телефона')
  
  const users = getUsers()
  if (
    users.find(
      (user) =>
        normalizeEmail(user.email) === normalizedEmail ||
        normalizeEmail(user.username) === normalizedEmail
    )
  ) {
    throw new Error('Аккаунт с такой почтой уже существует')
  }
  const user = ensureUserStructure({
    username: normalizedEmail,
    email: normalizedEmail,
    password,
    firstName: normalize(firstName),
    lastName: normalize(lastName),
    birthdate: normalize(birthdate),
    phone: normalize(phone),
    role: 'guest',
    access: {},
    createdAt: new Date().toISOString()
  })
  users.push(user)
  setUsers(users)
  setCurrentUser({
    username: user.username,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: user.birthdate,
    phone: user.phone,
    avatar: user.avatar,
    access: user.access
  })
  return user
}

export function login(email, password) {
  const normalizedEmail = ensureEmail(email)
  const normalizedPassword = normalize(password)
  const fallbackUsername = normalizedEmail.includes('@')
    ? normalizedEmail.split('@')[0]
    : normalizedEmail
  const user = getUsers().find(
    (candidate) =>
      (normalizeEmail(candidate.email) === normalizedEmail ||
        normalizeEmail(candidate.username) === normalizedEmail ||
        normalizeEmail(candidate.username) === fallbackUsername) &&
      candidate.password === normalizedPassword
  )
  if (!user) throw new Error('Неверная почта или пароль')
  setCurrentUser({
    username: user.username,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    access: user.access
  })
  return user
}

export function updateUserRole(username, role) {
  const updatedUsers = getUsers().map((user) =>
    normalizeEmail(user.username) === normalizeEmail(username) ? { ...user, role } : user
  )
  setUsers(updatedUsers)
  const current = getCurrentUser()
  if (current && normalizeEmail(current.username) === normalizeEmail(username)) {
    const full = updatedUsers.find(
      (user) => normalizeEmail(user.username) === normalizeEmail(username)
    )
    if (full) {
      setCurrentUser({
        username: full.username,
        role,
        email: full.email,
        firstName: full.firstName,
        lastName: full.lastName,
        avatar: full.avatar,
        access: full.access
      })
    }
  }
}

export function upsertUser(obj) {
  const users = getUsers()
  const normalizedEmail = normalizeEmail(obj.email || obj.username)
  if (!normalizedEmail) return
  const base = ensureUserStructure({
    ...obj,
    username: normalizedEmail,
    email: normalizedEmail,
    access: obj.access ?? {}
  })
  const index = users.findIndex(
    (user) => normalizeEmail(user.username) === normalizedEmail
  )
  if (index >= 0) users[index] = { ...users[index], ...base }
  else users.push(base)
  setUsers(users)
  const current = getCurrentUser()
  if (current && normalizeEmail(current.username) === normalizedEmail) {
    const full = users[index >= 0 ? index : users.length - 1]
    setCurrentUser({
      username: full.username,
      role: full.role,
      email: full.email,
      firstName: full.firstName,
      lastName: full.lastName,
      avatar: full.avatar,
      access: full.access
    })
  }
}

/**
 * Обновить email и/или пароль пользователя
 * @param {string} username - текущий username (email)
 * @param {{email?: string, password?: string, phone?: string}} data
 */
export function updateUserCredentials(username, data = {}) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) throw new Error('Некорректный пользователь')

  const users = getUsers()
  const index = users.findIndex(
    (user) => normalizeEmail(user.username) === normalizedUsername
  )
  if (index === -1) throw new Error('Пользователь не найден')

  const newEmail = data.email ? ensureEmail(data.email) : null
  if (newEmail) {
    const exists = users.some(
      (user, i) =>
        i !== index &&
        (normalizeEmail(user.email) === normalizeEmail(newEmail) ||
          normalizeEmail(user.username) === normalizeEmail(newEmail))
    )
    if (exists) throw new Error('Аккаунт с такой почтой уже существует')
  }

  const updatedUser = {
    ...users[index],
    email: newEmail || users[index].email,
    username: newEmail ? normalizeEmail(newEmail) : users[index].username,
    password: data.password ? normalize(data.password) : users[index].password,
    phone: data.phone ? normalize(data.phone) : users[index].phone,
  }

  users[index] = ensureUserStructure(updatedUser)
  setUsers(users)

  const current = getCurrentUser()
  if (current && normalizeEmail(current.username) === normalizedUsername) {
    const full = users[index]
    setCurrentUser({
      username: full.username,
      role: full.role,
      email: full.email,
      firstName: full.firstName,
      lastName: full.lastName,
      phone: full.phone,
      avatar: full.avatar,
      access: full.access
    })
  }

  return users[index]
}

export function deleteUser(username) {
  const normalizedEmail = normalizeEmail(username)
  setUsers(
    getUsers().filter((user) => normalizeEmail(user.username) !== normalizedEmail)
  )
  const current = getCurrentUser()
  if (current && normalizeEmail(current.username) === normalizeEmail) logout()
}

export function setAccess(username, access) {
  const normalizedEmail = normalizeEmail(username)
  const users = getUsers().map((user) =>
    normalizeEmail(user.username) === normalizedEmail
      ? { ...user, access: ensureAccess(access) }
      : user
  )
  setUsers(users)
}

export const getUserFull = (username) =>
  getUsers().find((user) => normalizeEmail(user.username) === normalizeEmail(username)) || null

export function addAnswerResult(username, subject, correct) {
  const key = normalize(username) || 'guest-anon'
  const stats = load(LS_STATS, {})
  if (!stats[key]) stats[key] = { total: 0, correct: 0, subjects: {} }
  const summary = stats[key]
  summary.total += 1
  if (correct) summary.correct += 1
  if (!summary.subjects[subject]) summary.subjects[subject] = { total: 0, correct: 0 }
  summary.subjects[subject].total += 1
  if (correct) summary.subjects[subject].correct += 1
  save(LS_STATS, stats)
  return stats[key]
}

export function getStats(username) {
  const key = normalize(username) || 'guest-anon'
  const stats = load(LS_STATS, {})
  return stats[key] || { total: 0, correct: 0, subjects: {} }
}

// Уведомления
export function addNotification(username, notification) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) return
  
  const notifications = load(LS_NOTIFICATIONS, {})
  if (!notifications[normalizedUsername]) {
    notifications[normalizedUsername] = []
  }
  
  notifications[normalizedUsername].unshift({
    id: Date.now(),
    text: notification.text,
    emoji: notification.emoji || '📢',
    link: notification.link || null,
    unread: true,
    timestamp: new Date().toISOString()
  })
  
  save(LS_NOTIFICATIONS, notifications)
}

export function getNotifications(username) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) return []
  
  const notifications = load(LS_NOTIFICATIONS, {})
  return notifications[normalizedUsername] || []
}

export function getUnreadCount(username) {
  const notifications = getNotifications(username)
  return notifications.filter(n => n.unread).length
}

export function markNotificationAsRead(username, notificationId) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) return false
  
  const notifications = load(LS_NOTIFICATIONS, {})
  const userNotifications = notifications[normalizedUsername] || []
  
  const notification = userNotifications.find(n => n.id === notificationId)
  if (notification && notification.unread) {
    notification.unread = false
    save(LS_NOTIFICATIONS, notifications)
    return true
  }
  return false
}

export function markAllNotificationsAsRead(username) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) return
  
  const notifications = load(LS_NOTIFICATIONS, {})
  const userNotifications = notifications[normalizedUsername] || []
  
  userNotifications.forEach(n => {
    n.unread = false
  })
  
  save(LS_NOTIFICATIONS, notifications)
}

export function clearNotifications(username) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername) return

  const notifications = load(LS_NOTIFICATIONS, {})
  if (notifications[normalizedUsername]) {
    notifications[normalizedUsername] = []
    save(LS_NOTIFICATIONS, notifications)
  }
}

// Запомнить последний выбранный курс для пользователя
export function setLastCourse(username, courseCode) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername || !courseCode || typeof localStorage === 'undefined') return
  localStorage.setItem(`${LS_LAST_COURSE_PREFIX}${normalizedUsername}`, courseCode)
}

// Получить последний выбранный курс пользователя
export function getLastCourse(username) {
  const normalizedUsername = normalizeEmail(username)
  if (!normalizedUsername || typeof localStorage === 'undefined') return null
  return localStorage.getItem(`${LS_LAST_COURSE_PREFIX}${normalizedUsername}`)
}
