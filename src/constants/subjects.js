/**
 * Централизованный маппинг всех предметов платформы
 */

export const SUBJECTS = {
  math: 'Математика (профиль)',
  mathb: 'Математика (база)',
  rus: 'Русский язык',
  phys: 'Физика',
  inf: 'Информатика',
  bio: 'Биология',
  chem: 'Химия',
  geo: 'География',
  soc: 'Обществознание',
  hist: 'История',
  lit: 'Литература',
  en: 'Английский язык',
  de: 'Немецкий язык',
  fr: 'Французский язык',
  sp: 'Испанский язык',
}

/**
 * Определить тип экзамена на основе класса пользователя
 * @param {number|null} grade - Класс пользователя
 * @returns {'oge'|'ege'} Тип экзамена
 */
export function getExamType(grade) {
  if (!grade) return 'ege' // По умолчанию ЕГЭ для выпускников
  return grade >= 9 ? 'ege' : 'oge'
}

/**
 * Получить название предмета по коду
 */
export function getSubjectName(code) {
  return SUBJECTS[code] || code
}

/**
 * Получить все предметы в виде массива
 */
export function getAllSubjects() {
  return Object.entries(SUBJECTS).map(([code, name]) => ({
    code,
    name,
  }))
}

/**
 * Маппинг кодов предметов на коды БД с учетом типа экзамена
 * @param {string} subjectCode - Код предмета (math, rus, bio и т.д.)
 * @param {'oge'|'ege'} examType - Тип экзамена
 * @returns {string} Код БД
 */
export function getSubjectDbCode(subjectCode, examType = 'oge') {
  // Если код уже содержит суффикс, возвращаем как есть
  if (subjectCode.includes('_oge') || subjectCode.includes('_ege')) {
    return subjectCode
  }
  
  // Маппинг кодов предметов на коды БД
  // В БД mathb хранится как mathb, а не math
  const codeMap = {
    math: 'math',
    mathb: 'mathb', // Важно: mathb остается mathb, а не преобразуется в math
    rus: 'russian',
    russian: 'russian',
    phys: 'phys',
    inf: 'inf',
    bio: 'bio',
    chem: 'chem',
    geo: 'geo',
    soc: 'soc',
    hist: 'hist',
    lit: 'lit',
    en: 'en',
    de: 'de',
    fr: 'fr',
    sp: 'sp',
  }
  
  const baseCode = codeMap[subjectCode] || subjectCode
  
  // Если в БД код хранится без суффикса (как сейчас), возвращаем без суффикса
  // Иначе добавляем суффикс
  const suffix = examType === 'ege' ? '_ege' : '_oge'
  return `${baseCode}${suffix}`
}

/**
 * Обратный маппинг: код БД -> код предмета
 */
export const DB_SUBJECT_MAP = {
  // ОГЭ
  math_oge: 'math',
  mathb_oge: 'mathb',
  mathb: 'mathb', // Коды без суффикса из БД
  bio: 'bio',
  russian_oge: 'rus',
  russian: 'rus',
  phys_oge: 'phys',
  phys: 'phys',
  inf_oge: 'inf',
  inf: 'inf',
  bio_oge: 'bio',
  chem_oge: 'chem',
  chem: 'chem',
  geo_oge: 'geo',
  geo: 'geo',
  soc_oge: 'soc',
  soc: 'soc',
  hist_oge: 'hist',
  hist: 'hist',
  lit_oge: 'lit',
  lit: 'lit',
  en_oge: 'en',
  en: 'en',
  de_oge: 'de',
  de: 'de',
  fr_oge: 'fr',
  fr: 'fr',
  sp_oge: 'sp',
  sp: 'sp',
  // ЕГЭ
  math_ege: 'math',
  mathb_ege: 'mathb',
  russian_ege: 'rus',
  phys_ege: 'phys',
  inf_ege: 'inf',
  bio_ege: 'bio',
  chem_ege: 'chem',
  geo_ege: 'geo',
  soc_ege: 'soc',
  hist_ege: 'hist',
  lit_ege: 'lit',
  en_ege: 'en',
  de_ege: 'de',
  fr_ege: 'fr',
  sp_ege: 'sp',
}

