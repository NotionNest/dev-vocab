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
  const [searchQuery, setSearchQuery] = useState('')

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

  // 过滤单词列表
  const filterWords = (words: WordItem[]): WordItem[] => {
    if (!searchQuery.trim()) {
      return words
    }

    const query = searchQuery.toLowerCase().trim()
    return words.filter(word => {
      // 搜索单词原文
      if (word.originalText?.toLowerCase().includes(query)) {
        return true
      }
      // 搜索翻译文本
      if (word.translatedText?.toLowerCase().includes(query)) {
        return true
      }
      // 搜索音标
      if (word.pronunciation?.toLowerCase().includes(query)) {
        return true
      }
      // 搜索释义
      if (
        word.definitions?.some(def =>
          def.meanings.some(meaning => meaning.toLowerCase().includes(query))
        )
      ) {
        return true
      }
      // 搜索同义词
      // if (
      //   word.synonyms?.some(synonym => synonym.toLowerCase().includes(query))
      // ) {
      //   return true
      // }
      return false
    })
  }

  const filteredWords = filterWords(vocabularyEntries)

  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full">
        {/* 验证记忆 */}
        <ReviewModal2 getAllWords={getAllWords} />

        {/* search input */}
        <div className="px-4 mt-3 relative shrink-0">
          <Search
            size={16}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10"
          />
          <input
            type="text"
            placeholder="搜索单词……"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-1.5 px-2 pl-8 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* tab list */}
        <div className="px-4 pt-2 mt-2 shrink-0">
          <Tabs options={TABS} activeId={activeTab} onChange={setActiveTab} />
        </div>

        {/* word list - scrollable */}
        <div className="px-4 mt-3 flex-1 overflow-y-auto">
          <TabsContent value="all" activeId={activeTab}>
            {filteredWords.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                {searchQuery ? '未找到匹配的单词' : '暂无单词'}
              </div>
            ) : (
              filteredWords.map(item => (
                <WordListItem key={item.id} word={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="learning" activeId={activeTab}>
            {filteredWords.filter(item => item.state !== 'mastered').length ===
            0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                {searchQuery ? '未找到匹配的单词' : 'No not mastered words'}
              </div>
            ) : (
              filteredWords
                .filter(item => item.state !== 'mastered')
                .map(item => <WordListItem key={item.id} word={item} />)
            )}
          </TabsContent>

          <TabsContent value="mastered" activeId={activeTab}>
            {filteredWords.filter(item => item.state === 'mastered').length ===
            0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                {searchQuery ? '未找到匹配的单词' : 'No mastered words'}
              </div>
            ) : (
              filteredWords
                .filter(item => item.state === 'mastered')
                .map(item => <WordListItem key={item.id} word={item} />)
            )}
          </TabsContent>
        </div>
      </div>
    </div>
  )
}
