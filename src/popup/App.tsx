import { ThemeContext, useThemeProvider } from '@/hooks/useTheme'
import { Book, Moon, Settings, Sun } from 'lucide-react'
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from 'recharts'

export default function App() {
  const themeValue = useThemeProvider()
  const { theme, toggleTheme } = themeValue
  const isDark = theme === 'dark'

  const openOptionsPage = () => {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' })
  }

  const chartData = [
    { label: '总词汇', value: 100, fill: '#94a3b8' }, // 灰色
    { label: '学习中', value: 80, fill: '#fbbf24' }, // 黄色
    { label: '已掌握', value: 60, fill: '#10b981' }, // 绿色
    { label: '待复习', value: 40, fill: '#ef4444' }, // 红色
  ]
  const chartConfig = {
    value: {
      label: '词汇量',
      color: '#94a3b8',
    },
  } satisfies ChartConfig

  const progressData = [
    {
      label: '总词汇量',
      value: 100,
      color: 'gray',
    },
    {
      label: '学习中',
      value: 100,
      color: 'yellow',
    },
    {
      label: '已掌握',
      value: 100,
      color: 'emerald',
    },
    {
      label: '待复习',
      value: 100,
      color: 'red',
    },
  ]

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 pb-4">
        <div className="flex justify-end gap-2 rounded-md">
          <button
            onClick={openOptionsPage}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Open Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="w-72">
          <div>
            <div className="text-base mb-2 font-medium">进度</div>
            <div className="grid grid-cols-2 gap-2">
              {progressData.map(item => (
                <div
                  className="border rounded-md p-3 bg-panel"
                  key={item.label}
                >
                  <div
                    className={`flex text-${item.color}-500 dark:text-${item.color}-400 items-center gap-2 text-xs`}
                  >
                    <Book size={14} />
                    {item.label}
                  </div>
                  <div className="text-2xl font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">分布情况</div>
            <ChartContainer
              config={chartConfig}
              className="min-h-[150px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={value => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" radius={4}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
