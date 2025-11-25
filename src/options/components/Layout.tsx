import Logo from '@/components/Logo'
import { Database, SettingsIcon, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function OptionsLayout() {
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    setActiveMenu(pathname.split('/')[1])

  }, [pathname, activeMenu])

  const menu = [
    {
      id: 'general',
      name: '常规',
      icon: <SettingsIcon size={16} />,
    },
    {
      id: 'ai-translation',
      name: 'AI 与 翻译',
      icon: <Zap size={16} />,
    },
    {
      id: 'data-sync',
      name: '数据与同步',
      icon: <Database size={16} />,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <Logo />
      </div>
      <div className="flex flex-1">
        {/* sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800">
          <div className="px-3 pt-3 flex-1">
            {menu.map(item => (
              <div
                key={item.id}
                className={`flex cursor-pointer px-4 py-3 rounded-lg text-sm font-medium transition-colors items-center gap-2 
                 ${activeMenu === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
                }`}
                onClick={() => navigate(`/${item.id}`)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
            Developer v1.0.0
          </div>
        </div>

        {/* content */}
        <div className="flex-1 h-[calc(100vh-56px)] scroll-smoothbar p-4 bg-white dark:bg-gray-900 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
