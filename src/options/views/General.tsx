import { Moon, PanelLeft, Sun, X, Zap } from 'lucide-react'
import SettingCard from '../components/SettingCard'
import { useTheme } from '@/hooks/useTheme'

export default function General() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      <SettingCard title="外观">
        <div className='flex items-center gap-2'>
          <div className={`p-2 rounded-md ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-blue-100 text-blue-700'}`}>
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </div>

          <div className='flex-1'>
            <div className='text-sm font-medium text-black dark:text-white'>主题模式</div>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              {isDark ? '当前为暗色模式' : '当前为亮色模式'}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className='relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200 dark:bg-blue-600'
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </SettingCard>

      <SettingCard className="py-0" title="键盘快捷键">
        <div>
          {[
            {
              name: '捕获单词',
              shortcut: 'Ctrl+Shift+Y',
              icon: <Zap size={16} />,
            },
            {
              name: '关闭弹窗',
              shortcut: 'Esc',
              icon: <X size={16} />,
            },
            {
              name: '切换侧边栏',
              shortcut: 'Ctrl+Shift+L',
              icon: <PanelLeft size={16} />,
            },
          ].map(item => (
            <div
              className="flex items-center gap-2 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              key={item.name}
            >
              <div className="flex-1 flex items-center gap-3 text-black dark:text-white">
                {item.icon}
                <div>{item.name}</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                {item.shortcut.split('+').map((item, index) => {
                  return (
                    <div key={item}>
                      {index > 0 && <span>+</span>}
                      <span className="border border-gray-300 dark:border-gray-600 px-1 bg-white dark:bg-gray-700" key={item}>
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  )
}
