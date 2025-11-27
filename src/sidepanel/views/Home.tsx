import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent } from '@/components/Tabs'
import { useNavigate } from 'react-router-dom'
import ReviewModal2 from '../components/ReviewModal2'
import { vocabDB } from '@/lib/db/operations'

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all')
  const [vocabularyEntries, setVocabularyEntries] = useState<any[]>(
    []
  )

  const getAllWords = async () => {
    const res = await vocabDB.getAllWords()
    console.log('res', res);
    
    setVocabularyEntries(res)
  }

  useEffect(() => {
    getAllWords()

    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'updateVocabulary') {
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
        <ReviewModal2 />

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
              <div
                key={item.id}
                className="flex group items-center justify-between gap-5 hover:border-gray-200 dark:hover:border-gray-700 border border-transparent rounded-md py-3 px-2 cursor-pointer transition-colors"
                onClick={() => navigate(`/detail-word/${item.id}`)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {item.original}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>遇到: {item.count} 次</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>上次遇到: {item.lastEncounteredAt.split('T')[0]}</span>
                  </div>
                </div>

                {/* status */}
                <div className="items-center gap-2 hidden group-hover:flex text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="not-mastered" activeId={activeTab}>
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Not Mastered Content
            </div>
          </TabsContent>

          <TabsContent value="mastered" activeId={activeTab}>
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Mastered Content
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  )
}
