import { useState, useEffect } from 'react'
import { deleteUser, updateUserRole, upsertUser } from '../../../utils/userStore'
import { getAllSubjects, getSubjectName } from '../../../constants/subjects'

/**
 * Строка пользователя в таблице
 * @param {Object} user - Объект пользователя
 * @param {function} onUpdate - Функция обновления
 */
export default function UserRow({ user, onUpdate }) {
  const [isEditingAccess, setIsEditingAccess] = useState(false)
  const [selectedAccess, setSelectedAccess] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [subjects, setSubjects] = useState(getAllSubjects().map((s) => s.code))

  useEffect(() => {
    setSelectedAccess(user.access || {})
    const reloadSubjects = () => setSubjects(getAllSubjects().map((s) => s.code))
    const handleStorage = (e) => {
      if (!e || e.key === null || e.key === 'edumvp_courses_state_v1') {
        reloadSubjects()
      }
    }
    window.addEventListener('edumvp_courses_updated', () => {
      reloadSubjects()
    })
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('edumvp_courses_updated', () => {
        reloadSubjects()
      })
      window.removeEventListener('storage', handleStorage)
    }
  }, [user.access])

  const updateUserName = (username, field, value) => {
    const updatedUser = {
      ...user,
      [field]: value
    }
    upsertUser(updatedUser)
    onUpdate()
  }

  const handleRoleChange = (newRole) => {
    updateUserRole(user.username, newRole)
    onUpdate()
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    deleteUser(user.username)
    setShowDeleteConfirm(false)
    onUpdate()
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleAccessSave = () => {
    const updatedUser = { ...user, access: selectedAccess }
    upsertUser(updatedUser)
    setIsEditingAccess(false)
    onUpdate()
  }

  const handleAccessCancel = () => {
    setSelectedAccess(user.access || {})
    setIsEditingAccess(false)
  }

  const toggleAccess = (subject) => {
    setSelectedAccess(prev => ({
      ...prev,
      [subject]: { enabled: !(prev[subject]?.enabled) }
    }))
  }

  const enabledAccessCount = Object.values(user.access || {}).filter((item) => item?.enabled).length

  return (
    <>
      <tr key={user.username} className='border-t'>
        <td className='py-2'>
          <input
            type='text'
            value={user.firstName || ''}
            onChange={(e) => updateUserName(user.username, 'firstName', e.target.value)}
            className='border rounded px-2 py-1 text-sm w-full'
          />
        </td>
        <td className='py-2'>
          <input
            type='text'
            value={user.lastName || ''}
            onChange={(e) => updateUserName(user.username, 'lastName', e.target.value)}
            className='border rounded px-2 py-1 text-sm w-full'
          />
        </td>
        <td className='py-2'>{user.email || user.username}</td>
        <td>
          <select
            defaultValue={user.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className='border rounded px-2 py-1'
          >
            <option value='guest'>guest</option>
            <option value='student'>student</option>
            <option value='teacher'>teacher</option>
            <option value='admin'>admin</option>
          </select>
        </td>
        <td className='py-2'>
          {!isEditingAccess ? (
            <button
              onClick={() => setIsEditingAccess(true)}
              className='px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm whitespace-nowrap'
            >
              {enabledAccessCount > 0
                ? `${enabledAccessCount} предмет${enabledAccessCount > 1 ? 'а' : ''}`
                : 'Открыть'}
            </button>
          ) : (
            <button
              onClick={handleAccessCancel}
              className='px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm whitespace-nowrap'
            >
              Отмена
            </button>
          )}
        </td>
        <td className='py-2'>
          {!isEditingAccess && !showDeleteConfirm && (
            <button
              onClick={handleDelete}
              className='px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm whitespace-nowrap'
            >
              Удалить
            </button>
          )}
        </td>
      </tr>
      {isEditingAccess && (
        <tr className='border-t bg-blue-50'>
          <td colSpan='6' className='py-4 px-2'>
            <div className='space-y-3'>
              <div>
                <p className='text-sm font-medium text-gray-700 mb-2'>Выберите доступные предметы:</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                  {subjects.map((subject) => (
                      <label
                        key={subject}
                        className='flex items-center gap-2 p-2 rounded border border-blue-300 hover:bg-blue-100 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={selectedAccess[subject]?.enabled || false}
                          onChange={() => toggleAccess(subject)}
                          className='w-4 h-4 text-blue-600'
                        />
                      <span className='text-sm'>{getSubjectName(subject)}</span>
                      </label>
                  ))}
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleAccessSave}
                  className='px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm'
                >
                  Сохранить
                </button>
                <button
                  onClick={handleAccessCancel}
                  className='px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm'
                >
                  Отмена
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
      {showDeleteConfirm && (
        <tr className='border-t bg-red-50'>
          <td colSpan='6' className='py-4 px-2'>
            <div className='space-y-3'>
              <div className='text-sm text-gray-700'>
                <p className='font-medium mb-2'>Вы уверены, что хотите удалить пользователя?</p>
                <p className='text-gray-600'>
                  {user.firstName} {user.lastName} ({user.email || user.username})
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={confirmDelete}
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm'
                >
                  Удалить
                </button>
                <button
                  onClick={cancelDelete}
                  className='px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm'
                >
                  Отмена
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

