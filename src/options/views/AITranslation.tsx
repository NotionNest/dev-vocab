import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'
import SettingCard from '../components/SettingCard'

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

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code)
    chrome.storage.local.set({ [STORAGE_KEY]: code })
  }

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage)

  return (
    <div>
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
    </div>
  )
}
