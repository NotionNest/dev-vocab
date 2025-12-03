import { useState } from 'react'
import { TranslationService } from '@/background/utils/translate'
import { Button } from '@/components/ui/button'
import { GripVertical, Settings, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranslationServiceCardProps {
  service: TranslationService
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (service: TranslationService) => void
  onDelete?: (id: string) => void
  onTest: (service: TranslationService) => void
  isDragging?: boolean
  dragHandleProps?: Record<string, any>
}

/**
 * 翻译服务卡片
 * @param props 
 * @returns 
 */
export default function TranslationServiceCard({
  service,
  onToggle,
  onEdit,
  onDelete,
  onTest,
  isDragging = false,
  dragHandleProps,
}: TranslationServiceCardProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    await onToggle(service.id, !service.enabled)
    setIsToggling(false)
  }

  const getServiceTypeBadge = () => {
    const badges = {
      free: { text: '免费', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      llm: { text: 'LLM', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
      custom: { text: '自定义', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    }
    const badge = badges[service.type]
    return (
      <span className={cn('px-2 py-0.5 text-xs rounded-full font-medium', badge.color)}>
        {badge.text}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 transition-all',
        isDragging && 'opacity-50 scale-95',
        service.enabled ? 'ring-2 ring-blue-500/20' : ''
      )}
    >
      <div className="flex items-start gap-3">
        {/* 拖拽手柄 */}
        <div 
          className="cursor-grab active:cursor-grabbing pt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          {...dragHandleProps}
        >
          <GripVertical size={20} />
        </div>

        {/* 服务图标 */}
        <div className="text-2xl pt-0.5">
          {service.icon || '🔤'}
        </div>

        {/* 服务信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {service.name}
            </h3>
            {getServiceTypeBadge()}
            {service.configured ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
          
          {service.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {service.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>优先级: {service.priority}</span>
            <span>•</span>
            <span>{service.configured ? '已配置' : '未配置'}</span>
          </div>
        </div>

        {/* 启用开关 */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling || !service.configured}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              service.enabled
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700',
              isToggling && 'opacity-50 cursor-not-allowed',
              !service.configured && 'opacity-30 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                service.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(service)}
        >
          <Settings size={14} />
          配置
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onTest(service)}
          disabled={!service.configured}
        >
          测试
        </Button>

        {!service.isBuiltIn && onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(service.id)}
          >
            <Trash2 size={14} />
            删除
          </Button>
        )}
      </div>
    </div>
  )
}

