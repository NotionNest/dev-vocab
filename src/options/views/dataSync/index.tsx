import { Database } from 'lucide-react'
import SettingCard from '@/options/components/SettingCard'
import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

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
  const navigate = useNavigate()
  const location = useLocation()

  // 从当前路径提取活动菜单
  // 例如: /data-sync/local -> 'local', /data-sync/notion -> 'notion'
  const currentPath = location.pathname.split('/').pop() || 'local'

  // 页面初始化时，如果路径为空或是父路径，自动跳转到默认路径
  useEffect(() => {
    if (location.pathname.endsWith('/data-sync') || location.pathname === '/data-sync') {
      navigate(Menu[0].path, { replace: true })
    }
  }, [location.pathname, navigate])

  const navigateTo = (path: string) => {
    navigate(path)
  }

  return (
    <div>
      <SettingCard className="border-none" title="存储源">
        <div className="flex items-center gap-2">
          {Menu.map(item => (
            <div
              key={item.id}
              className={`cursor-pointer max-w-70 p-3 border-2 rounded-md ${
                currentPath === item.path ? 'border-blue-600' : 'border-gray-300'
              }`}
              onClick={() => navigateTo(item.path)}
            >
              <div
                className={`flex items-center gap-2 ${
                  currentPath === item.path ? 'text-blue-600' : 'text-gray-500'
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
