import SettingCard from '@/options/components/SettingCard'
import { Download, Trash2, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { MESSAGE } from '@/background/constants/message'
import { WordItem } from '@/background/utils/database'

interface ImportData {
  version?: string
  exportDate?: string
  totalWords?: number
  words: WordItem[]
}

export default function Local() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // 获取所有单词数据
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE.GET_ALL_WORDS,
      })

      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('获取数据失败')
      }

      const words: WordItem[] = response.data

      // 创建导出数据对象，包含元数据
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        totalWords: words.length,
        words: words,
      }

      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2)

      // 创建 Blob 对象
      const blob = new Blob([jsonString], { type: 'application/json' })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // 生成文件名（包含日期时间）
      const dateStr = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5)
      link.download = `devvocab-backup-${dateStr}.json`

      // 触发下载
      document.body.appendChild(link)
      link.click()

      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出数据失败:', error)
      alert('导出数据失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)

      // 读取文件内容
      const text = await file.text()
      let importData: ImportData

      try {
        importData = JSON.parse(text)
      } catch (error) {
        throw new Error('文件格式错误，请确保是有效的 JSON 文件')
      }

      // 验证数据格式
      if (!importData.words || !Array.isArray(importData.words)) {
        throw new Error('数据格式错误：缺少 words 数组')
      }

      if (importData.words.length === 0) {
        throw new Error('导入文件为空，没有可导入的单词')
      }

      // 获取现有单词，用于检查重复
      const existingWordsResponse = await chrome.runtime.sendMessage({
        action: MESSAGE.GET_ALL_WORDS,
      })
      const existingWords: WordItem[] = existingWordsResponse?.data || []
      const existingWordMap = new Map(
        existingWords.map(word => [word.originalText?.toLowerCase(), word.id])
      )
      const existingIdSet = new Set(existingWords.map(word => word.id))

      // 统计信息
      let successCount = 0
      let skipCount = 0
      let errorCount = 0
      const errors: string[] = []

      // 导入单词
      for (const word of importData.words) {
        try {
          // 验证单词数据完整性
          if (!word.originalText) {
            errorCount++
            errors.push(`跳过无效单词：缺少 originalText`)
            continue
          }

          // 检查是否已存在（根据原文判断）
          const wordKey = word.originalText.toLowerCase()
          if (existingWordMap.has(wordKey)) {
            skipCount++
            continue
          }

          // 确保必要字段存在，如果ID已存在则生成新ID
          let wordId = word.id || crypto.randomUUID()
          if (existingIdSet.has(wordId)) {
            wordId = crypto.randomUUID()
          }

          const wordToImport: WordItem = {
            id: wordId,
            originalText: word.originalText,
            translatedText: word.translatedText || '',
            pronunciation: word.pronunciation,
            definitions: word.definitions || [],
            alternativeTranslations: word.alternativeTranslations,
            synonyms: word.synonyms,
            examples: word.examples,
            sourceLanguage: word.sourceLanguage,
            targetLanguage: word.targetLanguage,
            contexts: word.contexts || [],
            lastEncounteredAt: word.lastEncounteredAt || Date.now(),
            createdAt: word.createdAt || Date.now(),
            count: word.count || 1,
            state: word.state || 'learning',
            nextReviewAt: word.nextReviewAt || Date.now(),
            interval: word.interval || 0,
            history: word.history || [],
          }

          // 导入单词
          const importResult = await chrome.runtime.sendMessage({
            action: MESSAGE.IMPORT_WORD,
            payload: wordToImport,
          })

          if (!importResult?.ok) {
            throw new Error(importResult?.error || '导入失败')
          }

          successCount++
        } catch (error) {
          errorCount++
          const errorMsg = `导入单词 "${word.originalText}" 失败: ${
            (error as Error).message
          }`
          errors.push(errorMsg)
          console.error(errorMsg, error)
        }
      }

      // 通知更新
      chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })

      // 显示导入结果
      const resultMessage = `导入完成！
成功：${successCount} 个
跳过（已存在）：${skipCount} 个
失败：${errorCount} 个${
        errors.length > 0 ? `\n\n错误详情：\n${errors.slice(0, 5).join('\n')}` : ''
      }${errors.length > 5 ? `\n...还有 ${errors.length - 5} 个错误` : ''}`

      alert(resultMessage)
    } catch (error) {
      console.error('导入数据失败:', error)
      alert(`导入失败：${(error as Error).message}`)
    } finally {
      setIsImporting(false)
      // 重置文件输入，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearData = async () => {
    // 双重确认
    const firstConfirm = confirm(
      '⚠️ 警告：此操作将永久删除所有词汇和统计数据！\n\n此操作不可恢复，请确保您已备份数据。\n\n是否继续？'
    )

    if (!firstConfirm) {
      return
    }

    const secondConfirm = confirm(
      '⚠️ 最后确认\n\n您确定要删除所有数据吗？\n\n输入"确认"并点击确定继续，或点击取消放弃。'
    )

    if (!secondConfirm) {
      return
    }

    try {
      setIsClearing(true)

      // 获取当前单词数量用于显示
      const wordsResponse = await chrome.runtime.sendMessage({
        action: MESSAGE.GET_ALL_WORDS,
      })
      const wordCount = wordsResponse?.data?.length || 0

      // 清除所有数据
      const result = await chrome.runtime.sendMessage({
        action: MESSAGE.CLEAR_ALL_WORDS,
      })

      if (!result?.ok) {
        throw new Error(result?.error || '清除数据失败')
      }

      // 通知更新
      chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })

      alert(`✅ 清除完成！\n\n已删除 ${wordCount} 个单词及其所有统计数据。`)
    } catch (error) {
      console.error('清除数据失败:', error)
      alert(`清除失败：${(error as Error).message}`)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <>
      <SettingCard className="border-none" title="本地备份">
        <div className="flex items-center gap-2">
          <div
            className={`max-w-70 min-w-50 bg-panel p-3 border-2 rounded-md flex flex-col items-center cursor-pointer transition-all hover:border-blue-400 hover:shadow-md ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleExport}
          >
            <div className="p-2 rounded-full bg-blue-100 text-blue-700">
              <Download size={20} />
            </div>
            <div className="mt-2 font-medium text-black dark:text-white">
              {isExporting ? '导出中...' : '导出数据'}
            </div>
            <p className="text-xs mt-2">下载 JSON 备份</p>
          </div>
          <div
            className={`max-w-70 min-w-50 bg-panel p-3 border-2 rounded-md flex flex-col items-center cursor-pointer transition-all hover:border-purple-400 hover:shadow-md ${
              isImporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleImportClick}
          >
            <div className="p-2 rounded-full bg-purple-100 text-purple-700">
              <Upload size={20} />
            </div>
            <div className="mt-2 font-medium text-black dark:text-white">
              {isImporting ? '导入中...' : '导入数据'}
            </div>
            <p className="text-xs mt-2">从 JSON 恢复</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
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
          <div
            className={`flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-red-300 text-red-500 cursor-pointer transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 ${
              isClearing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleClearData}
          >
            <Trash2 size={16} />
            <p>{isClearing ? '清除中...' : '清除数据'}</p>
          </div>
        </div>
      </SettingCard>
    </>
  )
}
