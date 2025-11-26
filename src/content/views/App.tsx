import { useEffect } from 'react'
import { ThemeContext, useThemeProvider } from '@/hooks/useTheme'
import PopupCard from '../components/popupCard'

interface AppProps {
  shadowRoot: HTMLElement
}

function App({ shadowRoot }: AppProps) {
  // 在 Shadow DOM 中禁用自动 DOM 更新，手动处理
  const themeValue = useThemeProvider({ autoUpdateDOM: false })
  
  // 为 Shadow DOM 应用主题类
  useEffect(() => {
    if (themeValue.theme === 'dark') {
      shadowRoot.classList.add('dark')
    } else {
      shadowRoot.classList.remove('dark')
    }
  }, [themeValue.theme, shadowRoot])
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <PopupCard />
    </ThemeContext.Provider>
  )
}

export default App
