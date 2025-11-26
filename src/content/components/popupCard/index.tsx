import { WORD_POPUP_EVENT, WordPopupPayload } from '@/lib/utils/messaging'
import { useEffect, useRef, useState } from 'react'
import { CornerDownLeft, Link } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import CardHeard from './CardHeard'
import styles from './index.css?inline'
import WordContent from './WordContent'
import { cn } from '@/lib/utils'
import SentenceContent from './SentenceContent'

export default function PopupCard2() {
  const [show, setShow] = useState(false)
  const [payload, setPayLoad] = useState<WordPopupPayload | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isContextExpanded, setIsContextExpanded] = useState(false)
  const [selectedWordLength, setSelectedWordLength] = useState(0)
  const contextRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  // 使用自定义 Hook 防止滚动穿透
  useScrollLock(cardRef, show)

  useEffect(() => {
    const handlePopup = (event: Event) => {
      const detail = (event as CustomEvent<WordPopupPayload>).detail
      console.log('detail', detail)
      setPayLoad(detail)
      if (detail.position) {
        setPosition(detail.position)
      }

      setIsContextExpanded(false)
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

  const addToVocabulary = (_word: string) => {
    // chrome.runtime.sendMessage({
    //   action: 'addToWordbook',
    //   text: word,
    // })
  }

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
      <CardHeard setShow={setShow} />

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
        <div className="text-sm bg-gray-100 overflow-hidden dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-4 relative group">
          <div className="context-side"></div>
          <div
            ref={contextRef}
            className={`wrap-break-word transition-all duration-200 ${
              !isContextExpanded ? 'line-clamp-3 overflow-hidden' : ''
            }`}
            onClick={() => setIsContextExpanded(!isContextExpanded)}
          >
            <div className="text-xs italic text-gray-700 dark:text-gray-300">
              {payload?.context.split(' ').map((item, index) => (
                <span
                  key={`context-${index}-${item}`}
                  className={cn(
                    item.toLowerCase() === payload?.original?.toLowerCase()
                      ? 'text-sky-600 dark:text-sky-400'
                      : ''
                  )}
                >
                  {item}{' '}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Link size={12} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {payload?.source}
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-5 py-4">
        <button
          type="button"
          disabled={!payload?.original || selectedWordLength === 0}
          onClick={() => {
            if (payload?.classification === 'word') {
              addToVocabulary(payload.original)
            }
          }}
          className="w-full rounded-md bg-sky-600 dark:bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 dark:hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center justify-center gap-1">
            {selectedWordLength > 0 ? `Add ${selectedWordLength} Words` : 'Add to Vocabulary'} <CornerDownLeft size={14} />
          </span>
        </button>
      </div>
    </div>
  )
}
