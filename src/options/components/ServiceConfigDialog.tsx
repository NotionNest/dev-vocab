import { useState, useEffect } from 'react'
import { TranslationService, TranslationServiceType, TranslationProviderId } from '@/lib/utils/translate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ServiceConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: TranslationService | null
  onSave: (serviceId: string, config: any, name?: string) => Promise<void>
  onAdd?: (service: Omit<TranslationService, 'id' | 'isBuiltIn'>) => Promise<void>
}

export default function ServiceConfigDialog({
  open,
  onOpenChange,
  service,
  onSave,
  onAdd,
}: ServiceConfigDialogProps) {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [model, setModel] = useState('')
  const [appId, setAppId] = useState('')
  const [appSecret, setAppSecret] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // 当对话框打开或 service 变化时，初始化表单
  useEffect(() => {
    if (service) {
      setName(service.name || '')
      setApiKey(service.config.apiKey || '')
      setApiEndpoint(service.config.apiEndpoint || '')
      setModel(service.config.model || '')
      setAppId(service.config.appId || '')
      setAppSecret(service.config.appSecret || '')
    } else {
      // 重置表单
      setName('')
      setApiKey('')
      setApiEndpoint('')
      setModel('')
      setAppId('')
      setAppSecret('')
    }
  }, [service, open])

  const handleSave = async () => {
    if (!service) return

    setIsSaving(true)
    try {
      const config: any = {}
      
      // 根据服务类型收集不同的配置
      if (service.providerId === TranslationProviderId.YOUDAO || 
          service.providerId === TranslationProviderId.BAIDU) {
        config.appId = appId
        config.appSecret = appSecret
      } else {
        config.apiKey = apiKey
        if (apiEndpoint) config.apiEndpoint = apiEndpoint
        if (model) config.model = model
      }

      await onSave(service.id, config)
      onOpenChange(false)
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存失败: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCustom = async () => {
    if (!onAdd || !name.trim()) {
      alert('请填写服务名称')
      return
    }

    setIsSaving(true)
    try {
      const newService: Omit<TranslationService, 'id' | 'isBuiltIn'> = {
        name: name.trim(),
        type: TranslationServiceType.CUSTOM,
        enabled: false,
        priority: 999,
        configured: Boolean(apiKey && apiEndpoint),
        config: {
          apiKey,
          apiEndpoint,
          model: model || 'gpt-3.5-turbo',
        },
        description: '自定义翻译服务',
        icon: '⚡',
      }

      await onAdd(newService)
      onOpenChange(false)
    } catch (error) {
      console.error('添加服务失败:', error)
      alert('添加失败: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const isAddMode = !service

  // 渲染不同服务类型的配置字段
  const renderConfigFields = () => {
    if (isAddMode) {
      // 添加自定义服务模式
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">服务名称 *</Label>
            <Input
              id="name"
              placeholder="输入服务名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="输入 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiEndpoint">API Endpoint *</Label>
            <Input
              id="apiEndpoint"
              placeholder="https://api.example.com/v1/chat/completions"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              OpenAI 兼容的 API 端点
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型名称</Label>
            <Input
              id="model"
              placeholder="gpt-3.5-turbo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </>
      )
    }

    if (!service) return null

    // 有道和百度翻译使用 appId 和 appSecret
    if (service.providerId === TranslationProviderId.YOUDAO || 
        service.providerId === TranslationProviderId.BAIDU) {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="appId">App ID *</Label>
            <Input
              id="appId"
              placeholder="输入 App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appSecret">App Secret *</Label>
            <Input
              id="appSecret"
              type="password"
              placeholder="输入 App Secret"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
            />
          </div>
        </>
      )
    }

    // Google Translate 不需要配置
    if (service.providerId === TranslationProviderId.GOOGLE) {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          Google Translate 是免费服务，无需配置 API Key
        </div>
      )
    }

    // 其他服务使用 API Key
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key *</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="输入 API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {/* LLM 服务显示额外配置 */}
        {service.type === TranslationServiceType.LLM && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                placeholder={service.config.apiEndpoint || ''}
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                留空使用默认端点
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">模型</Label>
              <Input
                id="model"
                placeholder={service.config.model || ''}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                留空使用默认模型
              </p>
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isAddMode ? '添加自定义服务' : `配置 ${service?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isAddMode 
              ? '添加支持 OpenAI API 格式的自定义翻译服务'
              : '配置翻译服务的 API 凭证'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderConfigFields()}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button
            onClick={isAddMode ? handleAddCustom : handleSave}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

