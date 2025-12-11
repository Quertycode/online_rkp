import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

/**
 * Доступные темы
 */
export const THEMES = {
  STANDARD: 'standard',
  DARK: 'theme_dark',
  PINK: 'theme_pink'
}

/**
 * Provider для управления темами
 */
export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('app_theme') || THEMES.STANDARD
  )
  
  // Применить тему к document.documentElement
  useEffect(() => {
    const root = document.documentElement
    
    // Удаляем все классы тем
    root.classList.remove('theme-standard', 'theme-dark', 'theme-pink')
    
    // Добавляем класс текущей темы
    if (currentTheme === THEMES.DARK) {
      root.classList.add('theme-dark')
    } else if (currentTheme === THEMES.PINK) {
      root.classList.add('theme-pink')
    } else {
      root.classList.add('theme-standard')
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('app_theme', currentTheme)
  }, [currentTheme])
  
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId)
  }
  
  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Хук для использования контекста темы
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

