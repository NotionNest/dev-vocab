import { Outlet } from 'react-router-dom'
import { Moon, Settings, Sun } from 'lucide-react'
import Logo from '@/components/Logo'
import { useTheme } from '@/hooks/useTheme'
import { MESSAGE } from '@/background/constants/message'

export default function Layout() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const openOptionsPage = () => {
    chrome.runtime.sendMessage({ action: MESSAGE.OPEN_OPTIONS_PAGE })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
        {/* logo */}
        <Logo />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openOptionsPage}
            className="text-gray-700 cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="text-gray-700 cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* content area - Outlet renders the matched child route */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        <Outlet />
      </div>

      {/* footer */}
      {/* <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 py-3 px-2 bg-white dark:bg-gray-900"></div> */}
    </div>
  )
}
