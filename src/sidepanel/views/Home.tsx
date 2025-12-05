import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent } from '@/components/Tabs'
import ReviewModal2 from '../components/ReviewModal2'
import { MESSAGE } from '@/background/constants/message'
import { WordItem } from '@/background/utils/database'
import WordListItem from '../components/WordListItem'

const TABS = [
  {
    id: 'all',
    name: '全部',
  },
  {
    id: 'learning',
    name: '学习中',
  },
  {
    id: 'mastered',
    name: '已掌握',
  },
] as const

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all')
  const [vocabularyEntries, setVocabularyEntries] = useState<WordItem[]>([])

  const getAllWords = async () => {
    const { data } = await chrome.runtime.sendMessage({
      action: MESSAGE.GET_ALL_WORDS,
    })

    setVocabularyEntries(data)
  }

  useEffect(() => {
    getAllWords()

    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'UPDATE_VOCABULARY') {
        getAllWords()
      }
    })
  }, [])

  useEffect(() => {
    console.log('vocabularyEntries')
  })

  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full">
        {/* 验证记忆 */}
        <ReviewModal2 getAllWords={getAllWords} />

        {/* search input */}
        <div className="px-4 mt-3 relative shrink-0">
          <Search
            size={16}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="搜索单词……"
            className="w-full py-1.5 px-2 pl-7 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* tab list */}
        <div className="px-4 pt-2 mt-2 shrink-0">
          <Tabs options={TABS} activeId={activeTab} onChange={setActiveTab} />
        </div>

        {/* word list - scrollable */}
        <div className="px-4 mt-3 flex-1 overflow-y-auto">
          <TabsContent value="all" activeId={activeTab}>
            {vocabularyEntries.map(item => (
              <WordListItem key={item.id} word={item} />
            ))}
          </TabsContent>

          <TabsContent value="learning" activeId={activeTab}>
            {vocabularyEntries.filter(item => item.state !== 'mastered')
              .length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                No not mastered words
              </div>
            ) : (
              vocabularyEntries
                .filter(item => item.state !== 'mastered')
                .map(item => <WordListItem key={item.id} word={item} />)
            )}
          </TabsContent>

          <TabsContent value="mastered" activeId={activeTab}>
            {vocabularyEntries.filter(item => item.state === 'mastered')
              .length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                No mastered words
              </div>
            ) : (
              vocabularyEntries
                .filter(item => item.state === 'mastered')
                .map(item => <WordListItem key={item.id} word={item} />)
            )}
          </TabsContent>
        </div>
      </div>
    </div>
  )
}
