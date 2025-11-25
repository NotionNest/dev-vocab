import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock8,
  SquareArrowOutUpRight,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// mock data
const words = [
  {
    id: 1,
    name: 'Word',
    definition: '单词',
    phonetic: 'ˈwɜːrd',
    partOfSpeech: 'noun',
    example: 'I love the word "hello".',
    synonyms: ['hello', 'hi', 'hey'],
    antonyms: ['bye', 'goodbye', 'farewell'],
    context: [
      {
        id: 1,
        content: 'The word "hello" is a greeting.',
        createdAt: '2025-01-01',
        source: 'Google',
      },
      {
        id: 2,
        content: 'The word "hello" is a greeting.',
        createdAt: '2025-01-01',
        source: 'Google',
      },
      {
        id: 3,
        content: 'The word "hello" is a greeting.',
        createdAt: '2025-01-01',
        source: 'Google',
      },
    ],
  },
]

const getWordById = (id: string) => {
  return words.find(word => word.id === parseInt(id))
}

type Word = {
  id: number
  name: string
  // 音标
  phonetic: string
  // 词性
  partOfSpeech: string
  // 释义
  definition: string
  // 例句
  example: string
  // 同义词
  synonyms: string[]
  // 反义词
  antonyms: string[]
  // 上下文
  context: {
    id: number
    content: string
    createdAt: string
    source: string
  }[]
}

export default function DetailWord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [word, setWord] = useState<Word | null>(null)

  useEffect(() => {
    console.log('id', id)
    if (!id) {
      navigate('/')
      return
    }

    const word = getWordById(id)
    if (word) {
      setWord(word)
    }
  }, [id])

  if (!word) {
    return <div>Loading...</div>
  }

  return (
    <div className="px-4 py-2 h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
        <button 
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={!id || parseInt(id) <= 1}
          onClick={() => navigate(`/word/${parseInt(id || '1') - 1}`)}
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          <span className="text-blue-500 dark:text-blue-400">{id}</span> / {words.length}
        </div>
        
        <button 
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          disabled={!id || parseInt(id) >= words.length}
          onClick={() => navigate(`/word/${parseInt(id || '1') + 1}`)}
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-2">
          <ArrowLeft className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => navigate('/')} size={18} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{word.name}</h1>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
          <span>/{word.phonetic}/</span>
          <Volume2 size={16} className="cursor-pointer hover:text-sky-500 dark:hover:text-sky-400 transition-colors" />
        </div>

        <div className="mt-2 flex flex-col">
          <div className="text-sm text-gray-500 dark:text-gray-400">{word.partOfSpeech}</div>
          <div className="text-base text-gray-900 dark:text-gray-100">{word.definition}</div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
            上下文记录（{word.context.length}）
          </div>
          {word.context.map(item => {
            return (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-md p-2 mb-2 bg-gray-100/40 dark:bg-gray-800/40"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.content}</div>
                <div className="flex gap-3 items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <SquareArrowOutUpRight size={12} />
                    {item.source}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {item.createdAt}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* footer */}
      <div className="">
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
          遇到: 1 次 • 上次遇到: 2025/11/24
        </div>
      </div>
    </div>
  )
}
