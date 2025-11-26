import { WordPopupPayload } from '@/types'
import { useEffect, useState } from 'react'
import styles from './index.css?inline'

export default function SentenceContent({
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
    const uniqueWords = Array.from(new Set(extractedWords))
      .map(word => ({
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
              className={`suggestion-word ${item.isSelected ? "selected" : ""}`}
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
