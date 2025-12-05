import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import SettingCard from '@/options/components/SettingCard'
import { Eye, EyeOff, Trash2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

const RequiredDatabasePropertiesTypeName = {
  Title: '标题',
  'Rich Text': '富文本',
  Select: '单选',
  'Multi-select': '多选',
  Date: '日期',
  Number: '数字',
  Email: '邮箱',
  Phone: '电话',
  URL: 'URL',
  Checkbox: '复选框',
  Formula: '公式',
}

const RequiredDatabaseProperties = [
  {
    name: 'Word',
    type: 'Title',
  },
  {
    name: 'Definition',
    type: 'Rich Text',
  },
  {
    name: 'Translation',
    type: 'Rich Text',
  },
  {
    name: 'Status',
    type: 'Select',
  },
  {
    name: 'Context',
    type: 'Rich Text',
  },
  {
    name: 'Source',
    type: 'URL',
  },
  {
    name: 'Tags',
    type: 'Multi-select',
  },
  {
    name: 'Created At',
    type: 'Date',
  },
  {
    name: 'Updated At',
    type: 'Date',
  },
]

export default function Notion() {
  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState('')
  const [databaseId, setDatabaseId] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    '未连接' | '测试中' | '已连接' | '连接失败'
  >('未连接')
  const [testMessage, setTestMessage] = useState('')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    if (token && databaseId) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [token, databaseId])

  const testConnection = async () => {
    if (!token || !databaseId) {
      return
    }

    setIsTesting(true)
    setConnectionStatus('测试中')
    setTestMessage('')

    try {
      // 清理 databaseId（移除连字符和空格）
      const cleanDatabaseId = databaseId.replace(/[-\s]/g, '')

      // 验证 databaseId 格式（应该是32位十六进制字符串）
      if (!/^[0-9a-f]{32}$/i.test(cleanDatabaseId)) {
        throw new Error('数据库 ID 格式错误，应为32位十六进制字符串')
      }

      // 调用 Notion API 获取数据库信息
      const response = await fetch(
        `https://api.notion.com/v1/databases/${cleanDatabaseId}`,
        {
          method: 'GET',
          headers: {
            'Notion-Version': '2022-06-28',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          throw new Error('Token 无效或已过期，请检查您的 Integration Token')
        } else if (response.status === 404) {
          throw new Error(
            '数据库不存在或集成没有访问权限。请确保：\n1. 数据库 ID 正确\n2. 集成已连接到该数据库'
          )
        } else if (response.status === 403) {
          throw new Error('没有访问权限，请确保集成已连接到该数据库')
        } else {
          throw new Error(
            errorData.message ||
              `请求失败 (${response.status}): ${response.statusText}`
          )
        }
      }

      const database = await response.json()

      // 检查必需的属性
      const properties = database.properties || {}
      const missingProperties: string[] = []
      const invalidProperties: Array<{ name: string; expected: string; actual: string }> = []

      RequiredDatabaseProperties.forEach(required => {
        const prop = properties[required.name]
        if (!prop) {
          missingProperties.push(required.name)
        } else {
          // 检查属性类型
          const actualType = prop.type
          // Notion API 返回的类型名称可能略有不同，需要映射
          const typeMap: Record<string, string[]> = {
            Title: ['title'],
            'Rich Text': ['rich_text'],
            Select: ['select'],
            'Multi-select': ['multi_select'],
            Date: ['date'],
            URL: ['url'],
          }

          const expectedTypes = typeMap[required.type] || [required.type.toLowerCase()]
          if (!expectedTypes.includes(actualType)) {
            invalidProperties.push({
              name: required.name,
              expected: required.type,
              actual: actualType,
            })
          }
        }
      })

      if (missingProperties.length > 0 || invalidProperties.length > 0) {
        let errorMsg = '数据库属性不完整或类型不匹配：\n\n'
        
        if (missingProperties.length > 0) {
          errorMsg += `缺少属性：${missingProperties.join(', ')}\n`
        }
        
        if (invalidProperties.length > 0) {
          errorMsg += `类型错误：\n${invalidProperties
            .map(p => `  - ${p.name}: 期望 ${p.expected}, 实际 ${p.actual}`)
            .join('\n')}`
        }
        
        errorMsg += '\n\n请参考上方的数据库属性要求进行配置。'
        throw new Error(errorMsg)
      }

      // 测试成功
      setConnectionStatus('已连接')
      setTestMessage(
        `✅ 连接成功！\n\n数据库名称：${database.title?.[0]?.plain_text || '未命名'}\n已找到所有必需的属性。`
      )

      // 保存配置（可选）
      // await chrome.storage.local.set({
      //   notionToken: token,
      //   notionDatabaseId: cleanDatabaseId,
      // })
    } catch (error) {
      setConnectionStatus('连接失败')
      setTestMessage(`❌ ${(error as Error).message}`)
    } finally {
      setIsTesting(false)
    }
  }
  return (
    <>
      <SettingCard title="Notion 配置">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>连接状态</div>
            <Badge
              variant="outline"
              className={
                connectionStatus === '已连接'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : connectionStatus === '连接失败'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : connectionStatus === '测试中'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : ''
              }
            >
              {connectionStatus}
            </Badge>
          </div>

          {testMessage && (
            <div
              className={`mb-4 p-3 rounded-md text-sm whitespace-pre-line ${
                connectionStatus === '已连接'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : connectionStatus === '连接失败'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {testMessage}
            </div>
          )}

          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="token">
                  集成 Token (Internal Integration Token)
                </FieldLabel>
                <div className="relative">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    className="bg-white dark:bg-gray-800 pr-10"
                    id="token"
                    placeholder="secret_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label={showToken ? '隐藏密码' : '显示密码'}
                  >
                    {showToken ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="database-id">
                  数据库 ID (Database ID)
                </FieldLabel>
                <Input
                  value={databaseId}
                  onChange={e => setDatabaseId(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                  id="database-id"
                  placeholder="32 位 hex 字符串"
                />
              </Field>

              <Field>
                <Button
                  type="button"
                  onClick={testConnection}
                  disabled={isDisabled || isTesting}
                  className="cursor-pointer bg-blue-600 text-white hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  variant="outline"
                  size="sm"
                >
                  <Zap size={16} />
                  {isTesting ? '测试中...' : '测试连接'}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* 分隔线 */}
          <Separator className="my-4" />

          <div>
            <div>数据库属性要求 (Database Properties):</div>
            <p className="text-xs my-2 text-gray-500 dark:text-gray-400">
              请确保您的 Notion 数据库包含以下列（区分大小写）：
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {RequiredDatabaseProperties.map(item => (
                <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
                  <span className="bg-gray-100 rounded-b-sm text-black font-semibold">
                    {item.name}
                  </span>
                  {
                    RequiredDatabasePropertiesTypeName[
                      item.type as keyof typeof RequiredDatabasePropertiesTypeName
                    ]
                  }
                  ({item.type})
                </div>
              ))}
            </div>

            {/* 提示 */}
            <div className="text-xs my-2 text-yellow-500 dark:text-yellow-400">
              ⚠️ 注意：当前版本不支持自定义属性映射，请务必使用上述英文列名。
            </div>
          </div>
        </div>
      </SettingCard>

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
