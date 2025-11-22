import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, getUserFull } from '../utils/userStore'
import { useDailyPlans } from '../modules/home/hooks/useDailyPlans'
import FiltersBar from '../modules/tasks/components/FiltersBar'
import TaskList from '../modules/tasks/components/TaskList'
import tasks from '../data/tasks.json'
import { tasksService } from '../services/tasks.service'
import { getSubjectDbCode, getExamType } from '../constants/subjects'

// MVP страницы банка заданий
export default function Tasks() {
  const user = getCurrentUser()
  const { plans, progress, markTrainerTaskAsCompleted } = useDailyPlans()
  
  // UI state
  const [subject, setSubject] = useState('all')
  const [topic, setTopic] = useState('all')
  const [category, setCategory] = useState('all')
  const [line, setLine] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('new')
  const [hideSolved, setHideSolved] = useState(false)
  const [bioTasks, setBioTasks] = useState([])
  const [loadingBio, setLoadingBio] = useState(false)
  const [bioError, setBioError] = useState(null)
  
  // Метаданные для фильтров
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [categories, setCategories] = useState([])
  const [lines, setLines] = useState([])
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const raw = localStorage.getItem('tasks_solved')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Определяем тип экзамена на основе класса пользователя
  const fullUser = user ? getUserFull(user.username) : null
  const userGrade = fullUser?.grade || user?.grade || null
  const examType = getExamType(userGrade)

  // Загружаем метаданные для фильтров (только для текущего типа экзамена)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [subjectsData, topicsData, categoriesData] = await Promise.all([
          tasksService.getSubjects(),
          tasksService.getTopics(),
          tasksService.getCategories(),
        ])
        
        // Фильтруем предметы по типу экзамена
        // В БД коды хранятся без суффикса (bio, mathb), но могут быть и с суффиксом
        const filteredSubjects = subjectsData.filter(s => {
          // Если код содержит суффикс, проверяем его
          if (s.code.includes('_')) {
            const suffix = examType === 'ege' ? '_ege' : '_oge'
            return s.code.endsWith(suffix)
          }
          // Если суффикса нет, считаем что это ОГЭ (по умолчанию для текущей БД)
          // Все предметы в БД сейчас без суффикса, значит это ОГЭ
          return examType === 'oge'
        })
        
        // Если после фильтрации нет предметов, но есть данные без суффикса,
        // добавляем их для ОГЭ
        if (filteredSubjects.length === 0 && examType === 'oge') {
          const subjectsWithoutSuffix = subjectsData.filter(s => !s.code.includes('_'))
          if (subjectsWithoutSuffix.length > 0) {
            setSubjects(subjectsWithoutSuffix)
            return
          }
        }
        
        setSubjects(filteredSubjects)
        setTopics(topicsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Ошибка загрузки метаданных:', error)
      }
    }

    loadMetadata()
  }, [examType, user])

  // Загружаем линии с учетом выбранного предмета
  useEffect(() => {
    const loadLines = async () => {
      try {
        // В БД коды хранятся без суффикса, используем код как есть
        const subjectCode = subject !== 'all' ? subject : undefined
        const linesData = await tasksService.getTopicLines(subjectCode)
        setLines(linesData)
      } catch (error) {
        console.error('Ошибка загрузки линий:', error)
        setLines([])
      }
    }

    loadLines()
  }, [subject, examType])

  // Загружаем задания из базы данных с учетом фильтров
  useEffect(() => {
    let isMounted = true
    
    const loadBioTasks = async () => {
      setLoadingBio(true)
      setBioError(null)
      
      // Таймаут для предотвращения бесконечной загрузки
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoadingBio(false)
          setBioError('Таймаут загрузки. Backend сервер не отвечает. Убедитесь, что сервер запущен на порту 3001.')
        }
      }, 6000) // 6 секунд таймаут
      
      try {
        // Маппинг предметов на коды БД с учетом типа экзамена
        // В БД коды хранятся без суффикса (mathb, bio), поэтому не добавляем суффикс
        let subjectCode = undefined
        if (subject !== 'all') {
          // Если код уже содержит суффикс, используем как есть
          if (subject.includes('_oge') || subject.includes('_ege')) {
            subjectCode = subject
          } else {
            // Иначе используем код без суффикса (как в БД)
            subjectCode = subject
          }
        }
        
        // Загружаем задания с учетом фильтров
        const topicId = topic !== 'all' ? parseInt(topic) : undefined
        const categoryId = category !== 'all' ? parseInt(category) : undefined
        const topicLine = line !== 'all' ? line : undefined
        
        const tasks = await tasksService.getAll(subjectCode, topicId, categoryId, topicLine)
        
        clearTimeout(timeoutId)
        
        if (!isMounted) return
        
        if (tasks.length === 0) {
          setBioError('Задания не найдены. Проверьте: 1) Backend сервер запущен на порту 3001, 2) База данных tasks.db находится в папке server')
        } else {
          setBioError(null) // Очищаем ошибку если задания загружены
        }
        setBioTasks(tasks)
      } catch (error) {
        clearTimeout(timeoutId)
        if (!isMounted) return
        
        console.error('Ошибка загрузки заданий:', error)
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          setBioError('Таймаут загрузки. Backend сервер не отвечает.')
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          setBioError('Не удалось подключиться к серверу. Убедитесь, что backend запущен на порту 3001.')
        } else {
          setBioError(`Ошибка загрузки: ${error.message || 'Не удалось подключиться к серверу'}`)
        }
        setBioTasks([])
      } finally {
        if (isMounted) {
          setLoadingBio(false)
        }
      }
    }

    loadBioTasks()
    
    return () => {
      isMounted = false
    }
  }, [subject, topic, category, line, examType])

  useEffect(() => {
    localStorage.setItem('tasks_solved', JSON.stringify(solvedIds))
  }, [solvedIds])

  // Объединяем задания из JSON и из базы данных
  const allTasks = useMemo(() => {
    return [...tasks, ...bioTasks]
  }, [bioTasks])

  const filtered = useMemo(() => {
    let list = allTasks.slice()
    if (subject !== 'all') {
      list = list.filter(t => t.subject === subject)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t => t.question.toLowerCase().includes(q))
    }
    if (hideSolved) list = list.filter(t => !solvedIds.includes(t.id))
    if (sort === 'new') list = list.slice().reverse()
    return list
  }, [allTasks, subject, search, sort, hideSolved, solvedIds])

  const handleSolve = (id) => {
    const wasAlreadySolved = solvedIds.includes(id)
    setSolvedIds(prev => (prev.includes(id) ? prev : [...prev, id]))
    
    // Если задание было решено впервые и прогресс тренажера не достиг максимума, обновляем прогресс
    if (!wasAlreadySolved && user && progress.trainer.completed < plans.trainer.total) {
      markTrainerTaskAsCompleted()
    }
  }

  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Банк заданий</h1>
          {userGrade && (
            <p className="text-sm text-gray-600 mt-1">
              {userGrade >= 9 ? 'ЕГЭ' : 'ОГЭ'} (класс {userGrade})
            </p>
          )}
        </div>
      </div>

      <FiltersBar
        subject={subject}
        onSubjectChange={(value) => {
          setSubject(value)
          // Сбрасываем фильтры по темам, категориям и линиям при смене предмета
          setTopic('all')
          setCategory('all')
          setLine('all')
        }}
        topic={topic}
        onTopicChange={setTopic}
        category={category}
        onCategoryChange={setCategory}
        line={line}
        onLineChange={setLine}
        subjects={subjects}
        topics={topics}
        categories={categories}
        lines={lines}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        hideSolved={hideSolved}
        onToggleHideSolved={() => setHideSolved(v => !v)}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Всего: {filtered.length} заданий
          {loadingBio && <span className="ml-2 text-gray-400">(загрузка заданий по биологии...)</span>}
          {bioError && !loadingBio && (
            <span className="ml-2 text-rose-600 text-xs">({bioError})</span>
          )}
        </div>
      </div>

      {loadingBio && bioTasks.length === 0 && !bioError ? (
        <div className="text-sm text-gray-500 border border-cyan-200 rounded-2xl p-6 bg-white/90 text-center">
          Загрузка заданий по биологии...
        </div>
      ) : bioError && subject === 'biology' ? (
        <div className="text-sm text-rose-600 border border-rose-200 rounded-2xl p-6 bg-white/90 text-center">
          {bioError}
          <div className="mt-2 text-xs text-gray-500">
            Убедитесь, что backend сервер запущен на порту 3001
          </div>
        </div>
      ) : (
        <TaskList tasks={filtered} solvedIds={solvedIds} onSolve={handleSolve} />
      )}
    </div>
  )
}