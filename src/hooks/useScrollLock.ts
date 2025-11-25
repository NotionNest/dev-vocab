import { useEffect, RefObject } from 'react'

/**
 * 自定义 Hook：防止滚动穿透
 * @param ref 需要锁定滚动的容器的 ref
 * @param enabled 是否启用锁定 (通常对应弹窗显示状态)
 */
export function useScrollLock(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !ref.current) return

    const handleWheel = (e: WheelEvent) => {
      // 1. 阻止事件冒泡，防止触发父页面的滚动
      e.stopPropagation()

      // 2. 检查事件目标是否在可滚动的容器内
      const target = e.target as HTMLElement
      const scrollableParent = target.closest('.overflow-y-auto') as HTMLElement | null

      // 如果不在滚动容器内，直接阻止默认行为（防止页面滚动）
      if (!scrollableParent) {
        e.preventDefault()
        return
      }

      // 3. 检查是否滚动到了边界
      const { scrollTop, scrollHeight, clientHeight } = scrollableParent
      const isAtTop = scrollTop <= 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 // 减1容错

      // 向上滚动且已在顶部，或向下滚动且已在底部时，阻止默认行为
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault()
      }
      // 否则允许滚动（浏览器会处理内部滚动，不会冒泡因为我们阻止了冒泡）
    }

    const element = ref.current
    // passive: false 允许调用 preventDefault
    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [enabled, ref])
}

