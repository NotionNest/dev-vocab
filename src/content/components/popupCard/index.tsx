import { WORD_POPUP_EVENT, WordPopupPayload } from '@/lib/utils/messaging'
import { useEffect, useRef, useState } from 'react'
import { useScrollLock } from '@/hooks/useScrollLock'
import CardHeard from './CardHeard'
import styles from './index.css?inline'
import { WordItem } from '@/lib/db/schema'
import WordReview from './wordReview'
import WordDetail from './wordDetail'

export default function PopupCard2() {
  const [show, setShow] = useState(false)
  const [payload, setPayLoad] = useState<WordPopupPayload | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  // 保存初始位置，用于重新计算
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null)
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const dragStartMousePosRef = useRef<{
    startX: number
    startY: number
    mouseX: number
    mouseY: number
  } | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const currentPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // 使用自定义 Hook 防止滚动穿透
  useScrollLock(cardRef, show)

  const positionDetection = (position: { x: number; y: number }) => {
    if (!cardRef.current) {
      setPosition(position || { x: 0, y: 0 })
      return
    }
    const { x, y } = position

    const rect = cardRef.current.getBoundingClientRect()

    const viewportWidth = window.innerWidth
    const viewPortHeight = window.innerHeight

    let left = x
    let top = y

    // 如果超出右侧（修复：应该使用 viewportWidth 而不是 viewPortHeight）
    if (rect.width && left + rect.width / 2 > viewportWidth) {
      left = viewportWidth - rect.width / 2 - 30
    }

    // 如果超出左侧
    if (rect.width && left - rect.width / 2 < 0) {
      left = rect.width / 2 + 30
    }

    // 如果超出底部
    if (rect.height && top + rect.height > viewPortHeight) {
      top = viewPortHeight - rect.height - 10
    }

    // 如果超出顶部
    if (top < 0) {
      top = 10
    }

    setPosition({ x: left, y: top })
  }

  useEffect(() => {
    const handlePopup = async (event: Event) => {
      const detail = (event as CustomEvent<WordPopupPayload>).detail
      // 判断是否已经在单词本中

      // 保存初始位置
      const initialPos = detail.position || { x: 0, y: 0 }
      initialPositionRef.current = initialPos

      // 先设置初始位置
      positionDetection(initialPos)

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

      setShow(true)
    }

    window.addEventListener(WORD_POPUP_EVENT, handlePopup as EventListener)

    return () => {
      window.removeEventListener(WORD_POPUP_EVENT, handlePopup as EventListener)
    }
  }, [])

  // 使用 ResizeObserver 监听弹窗高度变化，重新计算位置
  useEffect(() => {
    if (
      !show ||
      !cardRef.current ||
      !initialPositionRef.current ||
      isDragging
    ) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      // 当内容高度变化时，使用保存的初始位置重新计算
      // 拖动时不自动调整位置
      if (initialPositionRef.current && !isDragging) {
        // 使用 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
          positionDetection(initialPositionRef.current!)
        })
      }
    })

    resizeObserver.observe(cardRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [show, payload, isDragging])

  // 拖动处理函数
  const handleDragStart = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不触发拖动
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }

    // 阻止默认行为，避免选中文本
    e.preventDefault()

    // 初始化拖动状态
    dragStartMousePosRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      mouseX: e.clientX,
      mouseY: e.clientY,
    }
    dragStartPosRef.current = { ...position }
    currentPositionRef.current = { ...position }

    setIsDragging(true)
  }

  // 拖动移动处理 - 使用 requestAnimationFrame 优化性能
  useEffect(() => {
    if (!isDragging) {
      // 取消未完成的动画帧
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      return
    }

    const updatePosition = () => {
      if (
        !cardRef.current ||
        !dragStartMousePosRef.current ||
        !dragStartPosRef.current
      ) {
        return
      }

      const rect = cardRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewPortHeight = window.innerHeight

      // 计算鼠标移动距离
      const mouseX = dragStartMousePosRef.current.mouseX
      const mouseY = dragStartMousePosRef.current.mouseY

      const deltaX = mouseX - dragStartMousePosRef.current.startX
      const deltaY = mouseY - dragStartMousePosRef.current.startY

      let newX = dragStartPosRef.current.x + deltaX
      let newY = dragStartPosRef.current.y + deltaY

      // 边界检测
      if (rect.width && newX + rect.width / 2 > viewportWidth) {
        newX = viewportWidth - rect.width / 2 - 30
      }
      if (rect.width && newX - rect.width / 2 < 0) {
        newX = rect.width / 2 + 30
      }
      if (rect.height && newY + rect.height > viewPortHeight) {
        newY = viewPortHeight - rect.height - 10
      }
      if (newY < 0) {
        newY = 10
      }

      // 直接操作 DOM，避免 React 重新渲染
      cardRef.current.style.left = `${newX}px`
      cardRef.current.style.top = `${newY}px`

      // 更新 ref 中的位置
      currentPositionRef.current = { x: newX, y: newY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartMousePosRef.current) return

      // 更新鼠标位置
      dragStartMousePosRef.current.mouseX = e.clientX
      dragStartMousePosRef.current.mouseY = e.clientY

      // 使用 requestAnimationFrame 优化性能
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          updatePosition()
          rafIdRef.current = null
        })
      }
    }

    const handleMouseUp = () => {
      // 取消动画帧
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      // 同步状态，确保位置一致
      setPosition(currentPositionRef.current)
      setIsDragging(false)
      dragStartMousePosRef.current = null

      // 更新初始位置引用
      initialPositionRef.current = { ...currentPositionRef.current }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [isDragging])

  // 点击非弹窗区域关闭弹窗
  useEffect(() => {
    if (!show || isDragging) {
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
      if (payload && 'id' in payload) {
        chrome.runtime.sendMessage({ action: 'increaseCount', id: payload.id })
      }
      setShow(false)
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [show, isDragging])

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
        // 拖动时禁用 transition，提升性能
        transition: isDragging ? 'none' : 'all duration-200',
      }}
      className={`w-80 rounded-2xl scroll-smoothbar bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-black/5 dark:ring-white/10 ${
        isDragging ? '' : 'transition-all duration-200'
      }`}
    >
      <style>{styles}</style>
      {/* Header */}
      <CardHeard
        setShow={setShow}
        classification={payload?.classification}
        onDragStart={handleDragStart}
        isDragging={isDragging}
      />

      {isReviewing ? (
        <WordReview payload={payload} />
      ) : (
        <WordDetail payload={payload} closePopupCard={() => setShow(false)} />
      )}
    </div>
  )
}
