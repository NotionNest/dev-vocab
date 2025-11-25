import { useEffect, useState } from 'react'
import { Globe, Plus } from 'lucide-react'
import SettingCard from '../components/SettingCard'
import SortableServiceCard from '../components/SortableServiceCard'
import ServiceConfigDialog from '../components/ServiceConfigDialog'
import { Button } from '@/components/ui/button'
import { TranslationService, testTranslationService } from '@/lib/utils/translate'
import {
  getTranslationServices,
  updateTranslationService,
  addCustomTranslationService,
  deleteTranslationService,
  reorderTranslationServices,
} from '@/lib/utils/storage'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'zh-TW', name: '繁体中文', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
]

const STORAGE_KEY = 'targetLanguage'

export default function AITranslation() {
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN')
  const [isLoading, setIsLoading] = useState(true)
  
  // 翻译服务管理
  const [services, setServices] = useState<TranslationService[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<TranslationService | null>(null)
  const [_testingServiceId, setTestingServiceId] = useState<string | null>(null)

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 从 Chrome Storage 读取语言设置
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const savedLanguage = result[STORAGE_KEY]
      if (savedLanguage && typeof savedLanguage === 'string') {
        setSelectedLanguage(savedLanguage)
      }
      setIsLoading(false)
    })
  }, [])

  // 监听 Storage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        const newLanguage = changes[STORAGE_KEY].newValue
        if (newLanguage && typeof newLanguage === 'string' && newLanguage !== selectedLanguage) {
          setSelectedLanguage(newLanguage)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [selectedLanguage])

  // 加载翻译服务列表
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoadingServices(true)
    try {
      const loadedServices = await getTranslationServices()
      setServices(loadedServices)
    } catch (error) {
      console.error('加载服务失败:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code)
    chrome.storage.local.set({ [STORAGE_KEY]: code })
  }

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage)

  // 处理服务启用/禁用
  const handleToggleService = async (id: string, enabled: boolean) => {
    try {
      await updateTranslationService(id, { enabled })
      await loadServices()
    } catch (error) {
      console.error('切换服务状态失败:', error)
    }
  }

  // 打开配置对话框
  const handleEditService = (service: TranslationService) => {
    setSelectedService(service)
    setConfigDialogOpen(true)
  }

  // 打开添加服务对话框
  const handleAddService = () => {
    setSelectedService(null)
    setConfigDialogOpen(true)
  }

  // 保存服务配置
  const handleSaveConfig = async (serviceId: string, config: any) => {
    try {
      // 检查配置是否完整
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const configured = checkServiceConfigured(config, service)
      
      await updateTranslationService(serviceId, { 
        config,
        configured,
      })
      await loadServices()
    } catch (error) {
      console.error('保存配置失败:', error)
      throw error
    }
  }

  // 检查服务配置是否完整
  const checkServiceConfigured = (config: any, service: TranslationService): boolean => {
    // Google Translate 不需要配置
    if (service.providerId === 'google') return true
    
    // 百度和有道需要 appId 和 appSecret
    if (service.providerId === 'baidu' || service.providerId === 'youdao') {
      return Boolean(config.appId && config.appSecret)
    }
    
    // 其他服务需要 apiKey
    return Boolean(config.apiKey)
  }

  // 添加自定义服务
  const handleAddCustomService = async (service: Omit<TranslationService, 'id' | 'isBuiltIn'>) => {
    try {
      await addCustomTranslationService(service)
      await loadServices()
    } catch (error) {
      console.error('添加服务失败:', error)
      throw error
    }
  }

  // 删除服务
  const handleDeleteService = async (id: string) => {
    if (!confirm('确定要删除这个服务吗？')) return
    
    try {
      await deleteTranslationService(id)
      await loadServices()
    } catch (error) {
      console.error('删除服务失败:', error)
    }
  }

  // 测试服务
  const handleTestService = async (service: TranslationService) => {
    setTestingServiceId(service.id)
    try {
      const result = await testTranslationService(service, selectedLanguage)
      if (result.success) {
        alert(`测试成功！\n\n测试文本: Hello\n翻译结果: ${result.result}`)
      } else {
        alert(`测试失败：${result.message}`)
      }
    } catch (error) {
      alert(`测试失败：${(error as Error).message}`)
    } finally {
      setTestingServiceId(null)
    }
  }

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id)
      const newIndex = services.findIndex((s) => s.id === over.id)

      const reordered = arrayMove(services, oldIndex, newIndex)
      setServices(reordered)

      // 保存新的顺序
      try {
        await reorderTranslationServices(reordered)
      } catch (error) {
        console.error('保存排序失败:', error)
        // 失败时回滚
        await loadServices()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 目标语言选择 */}
      <SettingCard title="目标语言">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-md text-emerald-700 dark:text-emerald-400 mt-1">
            <Globe size={16} />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-black dark:text-white mb-1">
              翻译与定义语言
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              选择单词定义和翻译的语言
            </p>

            {/* 语言选择下拉框 */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>

            {/* 当前选择的语言提示 */}
            {selectedLang && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Current: <span className="font-medium text-blue-600 dark:text-blue-400">{selectedLang.nativeName}</span>
              </div>
            )}
          </div>
        </div>
      </SettingCard>

      {/* 翻译服务配置 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            翻译服务提供商
          </div>
          <Button
            size="sm"
            onClick={handleAddService}
            disabled={isLoadingServices}
          >
            <Plus size={14} />
            添加自定义服务
          </Button>
        </div>

        {isLoadingServices ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            加载中...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            没有可用的翻译服务
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {services.map((service) => (
                  <SortableServiceCard
                    key={service.id}
                    service={service}
                    onToggle={handleToggleService}
                    onEdit={handleEditService}
                    onDelete={!service.isBuiltIn ? handleDeleteService : undefined}
                    onTest={handleTestService}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* 提示信息 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 提示：翻译时会按优先级依次尝试已启用的服务，直到翻译成功。拖拽服务卡片可以调整优先级顺序。
          </p>
        </div>
      </div>

      {/* 配置对话框 */}
      <ServiceConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        service={selectedService}
        onSave={handleSaveConfig}
        onAdd={handleAddCustomService}
      />
    </div>
  )
}
