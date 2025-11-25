import { ThemeContext, useThemeProvider } from '@/hooks/useTheme'
import Router from './router'

export default function OptionsApp() {
  const themeValue = useThemeProvider()
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <Router />
    </ThemeContext.Provider>
  )
}
