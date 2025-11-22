/**
 * Цены на функции геймификации
 */
export const PRICES = {
  // Pomodoro таймер
  POMODORO_TIMER: 100,
  
  // Музыка
  MUSIC_UNLOCK: 30,           // Разблокировка раздела музыки (не используется)
  MUSIC_TRACK_LOFI_1: 70,     // Фон для идей (было: Спокойная мелодия)
  MUSIC_TRACK_LOFI_2: 50,     // Ночная лампа (было: Вечерний чил)
  MUSIC_TRACK_LOFI_3: 100,    // Продуктивный день (было: Утренний кофе)
  MUSIC_TRACK_LOFI_4: 30,     // Фон для учебы (новый)
  
  // Темы
  THEME_DARK: 500,            // Темная тема
  THEME_PINK: 300,            // Розовая тема
}

/**
 * Награды за активность
 */
export const COIN_REWARDS = {
  DAILY_PLAN: 10,             // За выполнение плана на день (100% прогресс)
  STREAK_5: 50,               // За 5 дней подряд
  TRAINER_10_TASKS: 1,        // За 10 заданий в тренажере
}

/**
 * Названия функций для покупок
 */
export const FEATURES = {
  POMODORO: 'pomodoro_timer',
  MUSIC_UNLOCK: 'music_unlock',
  MUSIC_LOFI_1: 'track_lofi_1',  // Фон для идей
  MUSIC_LOFI_2: 'track_lofi_2',  // Ночная лампа
  MUSIC_LOFI_3: 'track_lofi_3',  // Продуктивный день
  MUSIC_LOFI_4: 'track_lofi_4',  // Фон для учебы
  THEME_DARK: 'theme_dark',
  THEME_PINK: 'theme_pink',
}

/**
 * Описания функций
 */
export const FEATURE_DESCRIPTIONS = {
  [FEATURES.POMODORO]: {
    name: 'Pomodoro таймер',
    description: 'Техника управления временем для продуктивной учебы',
    icon: '⏱️',
    price: PRICES.POMODORO_TIMER
  },
  [FEATURES.MUSIC_UNLOCK]: {
    name: 'Фоновая музыка',
    description: 'Доступ к выбору Lo-Fi треков для фона',
    icon: '🎵',
    price: PRICES.MUSIC_UNLOCK
  },
  [FEATURES.MUSIC_LOFI_1]: {
    name: 'Фон для идей',
    description: 'Спокойная мелодия для творческой работы',
    icon: '💡',
    price: PRICES.MUSIC_TRACK_LOFI_1
  },
  [FEATURES.MUSIC_LOFI_2]: {
    name: 'Ночная лампа',
    description: 'Расслабляющий lo-fi трек для вечерних занятий',
    icon: '🌆',
    price: PRICES.MUSIC_TRACK_LOFI_2
  },
  [FEATURES.MUSIC_LOFI_3]: {
    name: 'Продуктивный день',
    description: 'Бодрящий lo-fi трек для активной учебы',
    icon: '☕',
    price: PRICES.MUSIC_TRACK_LOFI_3
  },
  [FEATURES.MUSIC_LOFI_4]: {
    name: 'Фон для учебы',
    description: 'Спокойный фон для концентрации на учебе',
    icon: '📚',
    price: PRICES.MUSIC_TRACK_LOFI_4
  },
  [FEATURES.THEME_DARK]: {
    name: 'Темная тема',
    description: 'Комфортное оформление для работы вечером',
    icon: '🌙',
    price: PRICES.THEME_DARK
  },
  [FEATURES.THEME_PINK]: {
    name: 'Розовая тема',
    description: 'Яркое и стильное оформление интерфейса',
    icon: '🌸',
    price: PRICES.THEME_PINK
  }
}

