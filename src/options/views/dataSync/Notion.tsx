import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import SettingCard from '@/options/components/SettingCard'
import { Trash2, Zap } from 'lucide-react'
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

  useEffect(() => {
    if (token && databaseId) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [token, databaseId])

  const testConnection = () => {
    console.log('testConnection')
  }
  return (
    <>
      <SettingCard title="Notion 配置">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>连接状态</div>
            <Badge variant="outline">未连接</Badge>
          </div>

          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="token">
                  集成 Token (Internal Integration Token)
                </FieldLabel>
                <Input
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                  id="token"
                  placeholder="secret_..."
                />
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
                  disabled={isDisabled}
                  className="cursor-pointer bg-blue-600 text-white hover:bg-blue-500 hover:text-white"
                  variant="outline"
                  size="sm"
                >
                  <Zap />
                  测试连接
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
