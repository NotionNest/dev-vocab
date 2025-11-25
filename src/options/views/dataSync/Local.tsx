import SettingCard from '@/options/components/SettingCard'
import { Download, Trash2, Upload } from 'lucide-react'

export default function Local() {
  return (
    <>
      <SettingCard className="border-none" title="本地备份">
        <div className="flex items-center gap-2">
          <div className="max-w-70 min-w-50 bg-panel p-3 border-2 rounded-md flex flex-col items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-700">
              <Download />
            </div>
            <div className="mt-2 font-medium text-black dark:text-white">
              导出数据
            </div>
            <p className="text-xs mt-2">下载 JSON 备份</p>
          </div>
          <div className="max-w-70 min-w-50 bg-panel p-3 border-2 rounded-md flex flex-col items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-700">
              <Upload />
            </div>
            <div className="mt-2 font-medium text-black dark:text-white">
              导入数据
            </div>
            <p className="text-xs mt-2">从 JSON 恢复</p>
          </div>
        </div>
      </SettingCard>

      {/* 分隔线 */}
      <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

      <SettingCard
        className="border border-red-300 bg-red-50"
        title="危险区域"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 text-red-500">
            <div className="font-medium">重置应用</div>
            <p className="text-xs">
              永久删除所有词汇和统计数据
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-red-300 text-red-500">
            <Trash2 size={16} />
            <p>清除数据</p>
          </div>
        </div>
      </SettingCard>
    </>
  )
}
