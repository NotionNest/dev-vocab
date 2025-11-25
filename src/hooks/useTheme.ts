import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const THEME_STORAGE_KEY = 'theme'

interface UseThemeProviderOptions {
  // 是否自动更新 document.documentElement
  // 在 Shadow DOM 中应设置为 false，手动处理主题类
  autoUpdateDOM?: boolean
}

export function useThemeProvider(options: UseThemeProviderOptions = {}) {
  const { autoUpdateDOM = true } = options
  const [theme, setTheme] = useState<Theme>('light')

  // 初始化：从 Chrome Storage 读取主题设置
  useEffect(() => {
    chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
      const savedTheme = result[THEME_STORAGE_KEY] as Theme
      setTheme(savedTheme || 'light')
    })
  }, [])

  // 监听主题变化并更新 DOM（仅在非 Shadow DOM 环境中）
  useEffect(() => {
    if (!autoUpdateDOM) return
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, autoUpdateDOM])

  // 监听 Chrome Storage 变化，实现跨页面实时同步
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[THEME_STORAGE_KEY]) {
        const newTheme = changes[THEME_STORAGE_KEY].newValue as Theme
        if (newTheme && newTheme !== theme) {
          setTheme(newTheme)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    // 保存到 Chrome Storage，触发其他页面的监听器
    chrome.storage.local.set({ [THEME_STORAGE_KEY]: newTheme })
  }

  return { theme, toggleTheme }
}

