import { MESSAGE } from '@/background/constants/message'
import { WordItem } from '@/background/utils/database'
import WordContext from '@/components/WordContext'
import dayjs from 'dayjs'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Clock8,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetailWord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vocabularyEntries, setVocabularyEntries] = useState<WordItem[]>([])
  const [word, setWord] = useState<WordItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const getWordDetail = async (id: string) => {
    const { data } = await chrome.runtime.sendMessage({
      action: MESSAGE.GET_WORD_BY_ID,
      payload: { id },
    })
    console.log('data', data)
    if (data) {
      setWord(data)
    }
  }

  const getAllWords = async () => {
    const { data } = await chrome.runtime.sendMessage({
      action: MESSAGE.GET_ALL_WORDS,
    })
    const res = data
    setVocabularyEntries(res)
    const index = res.findIndex((item: WordItem) => item.id === id) + 1
    setCurrentIndex(index)
  }

  useEffect(() => {
    console.log('id', id)
    if (!id) {
      navigate('/')
      return
    }
    getWordDetail(id)
    getAllWords()
  }, [id])

  if (!word) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-10 flex items-center pl-4">
          <ArrowLeft
            className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => navigate('/')}
            size={18}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      </div>
    )
  }

  const handlePageChange = (index: number) => {
    navigate(`/detail-word/${vocabularyEntries[index].id}`)
  }

  return (
    <div className="scroll-smoothbar py-2 h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArrowLeft
              className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => navigate('/')}
              size={18}
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {word.originalText}
            </h1>
          </div>
          <div>
            {word.pronunciation && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                <span>/{word.pronunciation}/</span>
                <Volume2
                  size={16}
                  className="cursor-pointer hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-lg mt-3 font-medium text-gray-900 dark:text-gray-100">
          {word.translatedText}
        </h1>

        <div className="mt-2 flex flex-col">
          {/* 显示词性和释义 */}
          {word.definitions && word.definitions.length > 0 && (
            <div className="space-y-1 text-sm">
              {word.definitions.map((def, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0">
                    {def.partOfSpeech}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {def.meanings.slice(0, 3).join('；')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context */}
        <div className="mt-4">
          <div className="text-sm mb-2 font-medium text-gray-500 dark:text-gray-100">
            上下文例句:
          </div>
          {word.contexts.map((context, index) => {
            return (
              <WordContext
                key={index}
                context={context.content}
                source={context.source}
                original={word.originalText}
                createdAt={context.createdAt}
              />
            )
          })}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-10">
          添加时间: {dayjs(word.createdAt).format('YYYY/MM/DD')}
        </div>
      </div>

      {/* 分页 */}
      <div className="px-4 flex items-center justify-between mt-4 py-2">
        <button
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentIndex <= 1}
          onClick={() => handlePageChange(currentIndex - 2)}
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          <span className="text-blue-500 dark:text-blue-400">
            {currentIndex}
          </span>
          / {vocabularyEntries.length}
        </div>

        <button
          className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={currentIndex >= vocabularyEntries.length}
          onClick={() => handlePageChange(currentIndex)}
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* footer */}
      <div className="px-4">
        <div className="flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-1 items-center justify-between gap-2">
            <button className="cursor-pointer w-full rounded-md py-2 border border-blue-500 dark:border-blue-600 bg-blue-500/10 dark:bg-blue-600/20 text-blue-500 dark:text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-500/20 dark:hover:bg-blue-600/30 transition-colors">
              <Clock8 size={16} />
              <span>立即复习</span>
            </button>
            <button className="cursor-pointer w-full rounded-md py-2 border border-emerald-500 dark:border-emerald-600 text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500/20 dark:hover:bg-emerald-600/20 transition-colors">
              <Archive size={16} />
              <span>标记为掌握</span>
            </button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          遇到: {word.count} 次 • 上次遇到:{' '}
          {dayjs(word.lastEncounteredAt).format('YYYY/MM/DD')}
        </div>
      </div>
    </div>
  )
}
