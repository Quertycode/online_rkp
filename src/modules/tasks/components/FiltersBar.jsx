import { useMemo, useEffect } from 'react'
import { getSubjectName, DB_SUBJECT_MAP } from '../../../constants/subjects'

/**
 * Панель фильтров: Раздел, Тема, Часть, Линия, Поиск
 * Минимум логики — все значения контролируются родителем
 */
export default function FiltersBar({
  subject,
  onSubjectChange,
  topic,
  onTopicChange,
  category,
  onCategoryChange,
  line,
  onLineChange,
  subjects = [],
  topics = [],
  categories = [],
  lines = [],
  search,
  onSearchChange,
  sort,
  onSortChange,
  hideSolved,
  onToggleHideSolved
}) {
  const subjectOptions = useMemo(() => {
    const options = []
    const subjectMap = new Map()
    
    subjects.forEach(s => {
      // Преобразуем код БД в код предмета
      // В БД коды могут быть без суффикса (bio, mathb) или с суффиксом (bio_oge, mathb_oge)
      let subjectCode = DB_SUBJECT_MAP[s.code] || s.code
      
      // Если код не найден в маппинге и содержит суффикс, убираем его
      if (subjectCode === s.code && s.code.includes('_')) {
        const withoutSuffix = s.code.replace(/_oge$|_ege$/, '')
        subjectCode = DB_SUBJECT_MAP[withoutSuffix] || withoutSuffix
      }
      
      // Если код все еще не найден, используем как есть (для mathb, bio и т.д.)
      if (subjectCode === s.code && !DB_SUBJECT_MAP[s.code]) {
        subjectCode = s.code
      }
      
      const examType = s.code.includes('_ege') ? 'ЕГЭ' : s.code.includes('_oge') ? 'ОГЭ' : ''
      const baseLabel = getSubjectName(subjectCode) || s.name || s.code
      const label = examType ? `${baseLabel} (${examType})` : baseLabel
      
      // Группируем предметы по коду (чтобы не дублировать)
      if (!subjectMap.has(subjectCode)) {
        subjectMap.set(subjectCode, { value: subjectCode, label })
      }
    })
    
    // Добавляем уникальные предметы и сортируем по алфавиту
    subjectMap.forEach((option) => {
      options.push(option)
    })
    
    // Сортируем по названию (алфавиту)
    options.sort((a, b) => a.label.localeCompare(b.label, 'ru'))
    
    console.log('FiltersBar: subjects =', subjects.length, 'options =', options.length, options)
    
    return options
  }, [subjects])

  // Убеждаемся, что subject соответствует одному из значений в options
  const validSubject = useMemo(() => {
    if (!subject || subjectOptions.length === 0) {
      return subjectOptions.length > 0 ? subjectOptions[0].value : ''
    }
    // Проверяем, есть ли subject в списке options
    const found = subjectOptions.find(opt => opt.value === subject)
    return found ? subject : (subjectOptions.length > 0 ? subjectOptions[0].value : '')
  }, [subject, subjectOptions])

  // Синхронизируем validSubject с родительским компонентом, если он изменился
  useEffect(() => {
    if (validSubject && validSubject !== subject && subjectOptions.length > 0) {
      onSubjectChange(validSubject)
    }
  }, [validSubject, subject, subjectOptions, onSubjectChange])

  return (
    <div className="w-full border border-cyan-200 bg-white/90 rounded-2xl p-3 md:p-4">
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={validSubject}
            onChange={(e) => {
              const selectedValue = e.target.value
              if (selectedValue) {
                onSubjectChange(selectedValue)
              }
            }}
            className="w-full border border-cyan-300 rounded-xl px-3 py-2 text-sm bg-white"
            disabled={subjectOptions.length === 0}
          >
            {subjectOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full border border-cyan-300 rounded-xl px-3 py-2 text-sm bg-white"
            disabled={topics.length === 0}
          >
            <option value="all">Все темы</option>
            {topics.map(t => (
              <option key={t.id} value={String(t.id)}>
                {t.topic_number ? `${t.topic_number}. ` : ''}{t.name || t.topic_name}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-cyan-300 rounded-xl px-3 py-2 text-sm bg-white"
            disabled={categories.length === 0}
          >
            <option value="all">Все категории</option>
            {categories.map(c => (
              <option key={c.id} value={String(c.id)}>
                {c.name || c.category_name}
              </option>
            ))}
          </select>

          <select
            value={line}
            onChange={(e) => onLineChange(e.target.value)}
            className="w-full border border-cyan-300 rounded-xl px-3 py-2 text-sm bg-white"
            disabled={lines.length === 0}
          >
            <option value="all">Все линии</option>
            {lines.map(l => (
              <option key={l.line} value={l.line}>
                {l.line}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск"
            className="w-full border border-cyan-300 rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hideSolved} onChange={onToggleHideSolved} />
          Скрыть решённые верно
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="ml-auto border border-cyan-300 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
        </select>
      </div>
    </div>
  )
}


