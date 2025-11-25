import { Database } from 'lucide-react'
import SettingCard from '@/options/components/SettingCard'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Menu = [
  {
    id: 'local-storage',
    path: 'local',
    name: '本地存储',
    icon: <Database size={16} />,
    description: '数据仅存储在当前浏览器中。快速但隔离。',
  },
  {
    id: 'notion-database',
    path: 'notion',
    name: 'Notion 数据库',
    icon: <Database size={16} />,
    description: '同步词汇到Notion数据库，随时随地访问。',
  },
]

export default function DataSync() {
  const [activeMenu, setActiveMenu] = useState<string>(Menu[0].id)
  const navigate = useNavigate()

  const navigateTo = (path: string) => {
    navigate(path)
    setActiveMenu(path)
  }

  return (
    <div>
      <SettingCard className="border-none" title="存储源">
        <div className="flex items-center gap-2">
          {Menu.map(item => (
            <div
              className={`cursor-pointer max-w-70 p-3 border-2 rounded-md ${
                activeMenu === item.path ? 'border-blue-600' : 'border-gray-300'
              }`}
              onClick={() => navigateTo(item.path)}
            >
              <div
                className={`flex items-center gap-2 ${
                  activeMenu === item.path ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.icon}
                <p className="text-base font-medium">{item.name}</p>
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </SettingCard>

      <Outlet />
    </div>
  )
}
