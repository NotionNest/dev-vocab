import { WordPopupPayload } from '@/types'
import { useEffect, useState } from 'react'
import WordContext from '@/components/WordContext'
import { CornerDownLeft, Volume2 } from 'lucide-react'
import styles from './index.css?inline'

export default function WordDetail({
  payload,
  closePopupCard
}: {
  payload: WordPopupPayload | null
  closePopupCard: () => void
}) {
  const [selectedWordLength, setSelectedWordLength] = useState(0)

  const addToVocabulary = () => {
    chrome.runtime.sendMessage({ action: 'addToVocabulary', detail: payload })
    closePopupCard()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const canAddWord =
        payload?.classification === 'word' && Boolean(payload?.original)
      if (!canAddWord) return

      event.preventDefault()
      addToVocabulary()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [payload])

  return (
    <>
      {/* Content */}
      <div className="px-5 max-h-[300px] overflow-y-auto">
        {payload?.classification === 'word' && (
          <WordContent payload={payload} />
        )}
        {payload?.classification === 'sentence' && (
          <SentenceContent
            payload={payload}
            setSelectedWordLength={setSelectedWordLength}
          />
        )}

        {/* Context */}
        <div className="mt-4">
          {payload?.context && payload?.source && payload?.original && (
            <WordContext
              context={payload?.context}
              source={payload?.source}
              original={payload?.original}
            />
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="px-5 py-4">
        <button
          type="button"
          disabled={
            payload?.classification === 'word'
              ? !payload?.text
              : selectedWordLength === 0
          }
          onClick={() => {
            if (payload?.classification === 'word') {
              addToVocabulary()
            }
          }}
          className="w-full rounded-md bg-sky-600 dark:bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 dark:hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center justify-center gap-1">
            {selectedWordLength > 0
              ? `Add ${selectedWordLength} Words`
              : 'Add to Vocabulary'}{' '}
            <CornerDownLeft size={14} />
          </span>
        </button>
      </div>
    </>
  )
}

function WordContent({ payload }: { payload: WordPopupPayload }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap">
        <p className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {payload.original}
        </p>

        <div className="flex items-center gap-2">
          {payload.phonetic && (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                /{payload.phonetic}/
              </div>
              <button className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 cursor-pointer transition-all duration-200">
                <Volume2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div>{payload.text}</div>

      {/* 显示词性和释义 */}
      {payload.definitions && payload.definitions.length > 0 && (
        <div className="space-y-1 text-sm">
          {payload.definitions.map((def, idx) => (
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
  )
}

function SentenceContent({
  payload,
  setSelectedWordLength,
}: {
  payload: WordPopupPayload
  setSelectedWordLength: (length: number) => void
}) {
  const [suggestedWords, setSuggestedWords] = useState<
    { word: string; isSelected: boolean }[]
  >([])

  useEffect(() => {
    if (!payload) return

    // 提取单词并转小写，然后基于提取后的单词去重
    const extractedWords = payload.original
      .split(' ')
      .map(item => item.match(/[a-zA-Z-]+/)?.[0]?.toLowerCase() ?? '')
      .filter(word => word.length > 0) // 过滤空字符串

    // 基于提取后的单词去重
    const uniqueWords = Array.from(new Set(extractedWords)).map(word => ({
      word,
      isSelected: false,
    }))

    setSuggestedWords(uniqueWords)
  }, [payload])

  useEffect(() => {
    setSelectedWordLength(suggestedWords.filter(w => w.isSelected).length)
  }, [suggestedWords])

  const suggestSelectedWords = (word: string) => {
    const words = suggestedWords.map(item => {
      if (item.word === word) {
        return { ...item, isSelected: !item.isSelected }
      }
      return item
    })
    setSuggestedWords(words)
  }

  return (
    <div className="">
      <style>{styles}</style>
      <p className="text-sm italic text-gray-400 dark:text-gray-300">
        {payload.original}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">{payload.text}</p>

      <div>
        <p className="text-sm text-gray-400 dark:text-gray-300 my-2">
          选择建议的单词
        </p>
        <div className="suggestion-word-container">
          {suggestedWords.map((item, index) => (
            <button
              key={`${item.word}-${index}`}
              className={`suggestion-word ${item.isSelected ? 'selected' : ''}`}
              onClick={() => suggestSelectedWords(item.word)}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
