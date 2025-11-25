import { ThemeContext, useThemeProvider } from '@/hooks/useTheme'
import { Moon, Settings, Sun } from 'lucide-react'
import { ChartContainer, ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar } from 'recharts'

export default function App() {
  const themeValue = useThemeProvider()
  const { theme, toggleTheme } = themeValue
  const isDark = theme === 'dark'

  const openOptionsPage = () => {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' })
  }

  const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ]

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: '#2563eb',
    },
    mobile: {
      label: 'Mobile',
      color: '#60a5fa',
    },
  } satisfies ChartConfig

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 pb-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={openOptionsPage}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Open Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="w-60">
          <div>
            <div className="text-lg font-medium">Your Progress</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-md p-3 bg-panel">1</div>
              <div className="border rounded-md p-3 bg-panel">2</div>
              <div className="border rounded-md p-3 bg-panel">3</div>
              <div className="border rounded-md p-3 bg-panel">4</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Weekly Stats</div>
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
