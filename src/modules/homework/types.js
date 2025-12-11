// Базовые типы для модуля домашних заданий (JSDoc для удобства в JS-проекте)

/**
 * @typedef {'test'|'open'|'mixed'} HomeworkType
 */

/**
 * @typedef {Object} HomeworkQuestion
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 */

/**
 * @typedef {Object} Homework
 * @property {string} id
 * @property {string} title
 * @property {HomeworkType} type
 * @property {string} courseId
 * @property {string} dueDate
 * @property {boolean} assignAll
 * @property {string[]} assigneeIds
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} [content]
 * @property {string} [material]
 * @property {HomeworkQuestion[]} [questions] // тестовые вопросы (можно вместе с open)
 */

/**
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} homeworkId
 * @property {string} studentId
 * @property {'draft'|'submitted'|'graded'} status
 * @property {Object<string, string>} answers
 * @property {string|null} submittedAt
 * @property {string|null} grade
 * @property {string|null} feedback
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

