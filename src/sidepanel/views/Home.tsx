import { ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { Tabs, TabsContent } from '@/components/Tabs'
import { useNavigate } from 'react-router-dom'
import ReviewModal2 from '../components/ReviewModal2'

const TABS = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'learning',
    name: 'Learning',
  },
  {
    id: 'mastered',
    name: 'Mastered',
  },
] as const

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all')

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
            placeholder="Search words..."
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
            {[
              {
                id: 1,
                name: 'word',
                count: 10,
                lastUpdated: '2025-01-01',
                definition: '单词',
                partOfSpeech: 'noun',
                isNew: true,
              },
              {
                id: 2,
                name: 'word2',
                count: 20,
                lastUpdated: '2025-01-02',
                definition: '单词2',
                partOfSpeech: 'verb',
                isNew: false,
              },
            ].map(item => (
              <div
                key={item.id}
                className="flex group items-center justify-between gap-5 hover:border-gray-200 dark:hover:border-gray-700 border border-transparent rounded-md py-3 px-2 cursor-pointer transition-colors"
                onClick={() => navigate(`/detail-word/${item.id}`)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>Count: {item.count} \</span>
                    <span>Last Updated: {item.lastUpdated}</span>
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
