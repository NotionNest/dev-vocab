import { WORD_POPUP_EVENT, WordPopupPayload } from '@/lib/utils/messaging'
import { useEffect, useRef, useState } from 'react'
import { CornerDownLeft } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import CardHeard from './CardHeard'
import styles from './index.css?inline'
import WordContent from './WordContent'
import SentenceContent from './SentenceContent'
import WordContext from '@/components/WordContext'
import { WordItem } from '@/lib/db/schema'

export default function PopupCard2() {
  const [show, setShow] = useState(false)
  const [payload, setPayLoad] = useState<WordPopupPayload | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedWordLength, setSelectedWordLength] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)

  // 使用自定义 Hook 防止滚动穿透
  useScrollLock(cardRef, show)

  useEffect(() => {
    const handlePopup = async (event: Event) => {
      const detail = (event as CustomEvent<WordPopupPayload>).detail
      // 判断是否已经在单词本中

      chrome.runtime.sendMessage(
        {
          action: 'getWordByOriginal',
          original: detail.original,
        },
        (response: { success: boolean; word: WordItem | null }) => {
          console.log('response', response)
          if (response.success && response.word) {
            setIsReviewing(true)
            setPayLoad(response.word as unknown as WordPopupPayload)
          } else {
            setIsReviewing(false)
            setPayLoad(detail)
          }
        }
      )

      setPosition(detail.position || { x: 0, y: 0 })
      setShow(true)
    }

    window.addEventListener(WORD_POPUP_EVENT, handlePopup as EventListener)

    return () => {
      window.removeEventListener(WORD_POPUP_EVENT, handlePopup as EventListener)
    }
  }, [])

  // 点击非弹窗区域关闭弹窗
  useEffect(() => {
    if (!show) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (!cardRef.current) {
        return
      }
      // 在 Shadow DOM 中，event.target 会被重定向到 host 元素
      // 使用 composedPath() 获取真实的事件路径
      const path = event.composedPath()
      if (path.includes(cardRef.current)) {
        return
      }
      setShow(false)
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [show])

  const addToVocabulary = () => {
    console.log('addToVocabulary', payload)
    chrome.runtime.sendMessage({ action: 'addToVocabulary', detail: payload })
    setShow(false)
  }

  useEffect(() => {
    if (!show) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || isReviewing) return
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
  }, [show, payload])

  if (!show) return null

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        overscrollBehavior: 'contain',
        boxShadow:
          '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
      className="w-80 rounded-2xl scroll-smoothbar bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200"
    >
      <style>{styles}</style>
      {/* Header */}
      <CardHeard setShow={setShow} classification={payload?.classification} />

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
            isReviewing ||
            (payload?.classification === 'word'
              ? !payload?.text
              : selectedWordLength === 0)
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
    </div>
  )
}
