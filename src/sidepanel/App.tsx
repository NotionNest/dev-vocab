import { ThemeContext, useThemeProvider } from '@/hooks/useTheme'
import Router from './router'

export default function SidepanelApp() {
  const themeValue = useThemeProvider()
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <Router />
    </ThemeContext.Provider>
  )
}
