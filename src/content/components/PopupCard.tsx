import { WORD_POPUP_EVENT, WordPopupPayload } from '@/lib/utils/messaging'
import { useEffect, useRef, useState } from 'react'
import { Settings, X, Copy, LoaderCircle, Volume2, CornerDownLeft } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'

export default function PopupCard2() {
  const [show, setShow] = useState(false)
  const [payload, setPayLoad] = useState<WordPopupPayload | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [suggestedWords, setSuggestedWords] = useState<
    { word: string; isSelected: boolean }[]
  >([])
  const [isContextExpanded, setIsContextExpanded] = useState(false)
  const contextRef = useRef<HTMLDivElement>(null)

  const cardRef = useRef<HTMLDivElement | null>(null)

  // 使用自定义 Hook 防止滚动穿透
  useScrollLock(cardRef, show)

  useEffect(() => {
    const handlePopup = (event: Event) => {
      console.log('event', event)

      const detail = (event as CustomEvent<WordPopupPayload>).detail

      if (detail.error) {
        setPayLoad(null)
        return
      }

      setPayLoad(detail)
      // 使用选中文本的位置
      if (detail.position) {
        setPosition(detail.position)
      }
      const words = detail.content
        .split(' ')
        .filter((w, index, self) => self.indexOf(w) === index)
        .map(w => {
          return {
            word: w.match(/[a-zA-Z-]+/)?.[0]?.toLowerCase() ?? '',
            isSelected: false,
          }
        })

      setSuggestedWords(words)
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

  function suggestSelectedWords(word: string) {
    const words = suggestedWords.map(w => {
      if (w.word === word) {
        return { ...w, isSelected: !w.isSelected }
      }
      return w
    })
    setSuggestedWords(words)
  }

  // 渲染带有高亮的句子内容
  const renderContent = () => {
    if (!payload?.content) return null

    if (payload.classification === 'word') {
      return (
        <div className="flex items-end gap-2">
          <div className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
            {payload.content}
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>/...../</div>
          <button className='text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 cursor-pointer transition-all duration-200'>
            <Volume2 size={16} />
          </button>
        </div>
      )
    }

    // 获取所有选中的单词
    const selectedWordsSet = new Set(
      suggestedWords.filter(w => w.isSelected).map(w => w.word.toLowerCase())
    )

    // 如果没有选中任何单词，直接显示原文
    if (selectedWordsSet.size === 0) {
      return (
        <div className="max-h-24 overflow-y-auto scroll-smoothbar overscroll-contain">
          <div className="text-sm text-gray-700 dark:text-gray-300">{payload.content}</div>
        </div>
      )
    }

    // 分割句子并保留分隔符，以便重建
    // 使用正则匹配单词和非单词部分
    const parts = payload.content.split(/([a-zA-Z-]+)/).filter(Boolean)

    return (
      <div className="max-h-24 overflow-y-auto scroll-smoothbar overscroll-contain">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {parts.map((part, index) => {
            const isWord = /[a-zA-Z-]+/.test(part)
            const lowerPart = part.toLowerCase()
            const isSelected = isWord && selectedWordsSet.has(lowerPart)

            return isSelected ? (
              <span
                key={index}
                className="bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 rounded-xs font-semibold"
              >
                {part}
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      {show && (
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
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Word Selection
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition"
                aria-label="Settings"
                onClick={() => {
                  chrome.runtime.sendMessage({ action: 'openOptionsPage' })
                }}
              >
                <Settings size={16} />
              </button>
              <button
                type="button"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition"
                onClick={() => setShow(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="px-5 max-h-[300px] overflow-y-auto">
            {renderContent()}

            <div
              className={`text-sm mt-2 flex items-center text-gray-500 dark:text-gray-400 ${
                payload?.classification === 'sentence'
                  ? 'border-b border-gray-200 dark:border-gray-700 pb-2'
                  : ''
              }`}
            >
              <span className="text-gray-500 dark:text-gray-400">释义：</span>
              <p className="flex items-center gap-1">
                {payload?.definition}
                {!payload?.definition && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}
              </p>
            </div>

            {payload?.classification === 'sentence' && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 my-2">
                  Suggested Words:
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedWords.map(word => (
                    <div
                      key={word.word}
                      className={`text-xs text-gray-700 dark:text-gray-300 cursor-pointer rounded-xl py-1 px-2 transition-colors ${
                        word.isSelected 
                          ? 'bg-sky-100 dark:bg-sky-900' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onClick={() => suggestSelectedWords(word.word)}
                    >
                      {word.word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-4 relative group">
              <div
                ref={contextRef}
                className={`wrap-break-word transition-all duration-200 ${
                  !isContextExpanded ? 'line-clamp-3 overflow-hidden' : ''
                }`}
                onClick={() => setIsContextExpanded(!isContextExpanded)}
              >
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-600 mb-2">
                  <span>Context:</span>
                  <button
                    onClick={e => e.stopPropagation()}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md p-1 transition-all"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{payload?.context}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 my-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Source: {payload?.source}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="px-5 py-4">
            <button
              type="button"
              disabled={
                !payload?.content ||
                suggestedWords.filter(w => w.isSelected).length === 0
              }
              className="w-full rounded-md bg-sky-600 dark:bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 dark:hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {payload?.classification === 'word' ? (
                <span className='flex items-center justify-center gap-1'>添加到生词本 <CornerDownLeft size={14} /></span>
              ) : (
                <span>
                  Add {suggestedWords.filter(w => w.isSelected).length} Words
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
