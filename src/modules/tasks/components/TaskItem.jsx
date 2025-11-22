import { useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Компонент для отображения текста с markdown изображениями
 * Изображения вставляются INLINE (как формулы в тексте) без переносов строк
 * Сохраняет переносы строк в тексте
 */
function MarkdownText({ text }) {
  if (!text) return null

  // Парсер markdown изображений: ![alt](url)
  const parts = []
  let lastIndex = 0
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match

  while ((match = imageRegex.exec(text)) !== null) {
    // Добавляем текст до изображения
    if (match.index > lastIndex) {
      const textContent = text.substring(lastIndex, match.index)
      parts.push({
        type: 'text',
        content: textContent,
      })
    }

    // Обрабатываем URL изображения
    let imageUrl = match[2]
    
    // Если URL уже содержит localhost, оставляем как есть
    if (!imageUrl.startsWith('http')) {
      // Относительный путь - добавляем базовый URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      imageUrl = `${apiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }

    // Добавляем изображение
    parts.push({
      type: 'image',
      alt: match[1] || 'Изображение',
      url: imageUrl,
    })

    lastIndex = match.index + match[0].length
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex)
    parts.push({
      type: 'text',
      content: remaining,
    })
  }

  // Если нет изображений, возвращаем текст с сохранением переносов
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return <div className="whitespace-pre-wrap">{text}</div>
  }

  // Рендерим части как inline элементы (формулы встраиваются в текст)
  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>
        } else {
          // Изображение как inline-block (формула в строке)
          return (
            <img
              key={index}
              src={part.url}
              alt={part.alt}
              className="inline-block align-middle max-h-8 mx-1"
              style={{ verticalAlign: 'middle' }}
              onError={(e) => {
                console.error('Ошибка загрузки изображения:', part.url)
                e.target.style.display = 'none'
              }}
            />
          )
        }
      })}
    </div>
  )
}

// Небольшой карточный элемент одного задания
export default function TaskItem({ task, isSolved, onSolve }) {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(null) // 'correct' | 'wrong'
  const [showSolution, setShowSolution] = useState(false)

  const placeholders = useMemo(() => {
    // Для визуала как в скриншоте подменим части вопроса номерами (1),(2) ... если есть
    return task.question
  }, [task])

  const getSubjectLabel = () => {
    const subjectNames = {
      math: 'Математика',
      mathb: 'Математика',
      rus: 'Русский',
      phys: 'Физика',
      inf: 'Информатика',
      bio: 'Биология',
      chem: 'Химия',
      geo: 'География',
      soc: 'Обществознание',
      hist: 'История',
      lit: 'Литература',
      en: 'Английский',
      de: 'Немецкий',
      fr: 'Французский',
      sp: 'Испанский',
    }
    return subjectNames[task.subject] || task.subject || 'Предмет'
  }

  const getTaskNumber = () => {
    // Для заданий из базы данных ID может быть вида "bio-1051"
    const idStr = String(task.id)
    if (idStr.includes('-')) {
      return idStr.split('-')[1] || idStr
    }
    return idStr
  }

  const check = () => {
    const normalized = answer.trim().toLowerCase()
    const ok = (task.answer || []).some(a => String(a).trim().toLowerCase() === normalized)
    setStatus(ok ? 'correct' : 'wrong')
    if (ok) onSolve(task.id)
  }

  const toggleSolution = () => {
    setShowSolution(prev => !prev)
  }

  return (
    <div className="border border-cyan-200 bg-white/90 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
          {getTaskNumber()}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{getSubjectLabel()}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">№{getTaskNumber().padStart(2,'0')}</span>
        {isSolved && (
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Решено верно</span>
        )}
      </div>

      <div className="text-sm text-gray-800 mb-3">
        <MarkdownText text={placeholders} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Введи ответ"
          className="flex-1 border border-cyan-300 rounded-xl px-3 py-2 text-sm"
        />
        <button onClick={check} className="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700">Проверить</button>
        <button 
          onClick={toggleSolution} 
          className={`px-4 py-2 rounded-xl border transition-colors ${
            showSolution 
              ? 'border-cyan-600 bg-cyan-50 text-cyan-700' 
              : 'border-cyan-300 text-cyan-700 hover:bg-cyan-50'
          }`}
        >
          {showSolution ? 'Скрыть' : 'Решение'}
        </button>
        <button className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">★</button>
      </div>

      {showSolution && task.solution && (
        <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
          <div className="text-sm text-gray-800">
            <MarkdownText text={task.solution} />
          </div>
        </div>
      )}

      {status === 'correct' && (
        <div className="mt-2 text-sm text-emerald-600">Верно!</div>
      )}
      {status === 'wrong' && (
        <div className="mt-2 text-sm text-rose-600">Неверно. Попробуй ещё.</div>
      )}
    </div>
  )
}


