import { classifySelection } from './word'
import { sendMessage } from './chrome'
import type { ExtensionMessage, WordPopupPayload } from '@/types/messaging'
import { WORD_POPUP_EVENT } from '@/types/messaging'
import { TranslationResult } from './translate'
import { getContextFromSelection } from './word'

// 重新导出供外部使用
export type { ExtensionMessage, WordPopupPayload }
export { WORD_POPUP_EVENT }

/**
 * 派发单词弹窗事件。
 * @param detail - 要派发的事件的详细信息。
 */
const dispatchPopupEvent = (detail: WordPopupPayload) => {
  window.dispatchEvent(new CustomEvent(WORD_POPUP_EVENT, { detail }))
}

/**
 * 处理从 popup 或 background 发送到 content script 的运行时消息
 * 此函数在 content script 中调用，用于响应来自扩展其他部分的消息
 *
 * @param {ExtensionMessage} request - 接收到的消息对象，包含 action 字段
 * @param {function} sendResponse - 用于发送响应回消息发送者的回调函数
 * @returns {void}
 */
export const handleRuntimeMessage = (
  request: ExtensionMessage,
  sendResponse: (response?: unknown) => void
) => {
  // 处理 ping 消息（用于测试连接是否正常）
  if (request.action === 'ping') {
    // 简单返回成功，表示消息通道正常
    sendResponse({ success: true })
  }

  if (request.action === 'translate') {
    const selection = window.getSelection()
    const text = selection?.toString().trim() ?? ''

    if (!selection || !text) return

    // 判断选择的是句子还是单词
    const classification = classifySelection(text)
    // 获取上下文句子（使用智能降级策略）
    const context = getContextFromSelection(selection)
    // 获取选中文本的 DOM 元素和位置
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10,
    }

    // 判断选择的是句子还是单词，用来展示不同的逻辑弹窗
    dispatchPopupEvent({
      classification: classification,
      original: text,
      context,
      source: window.location.hostname,
      position,
      text: '',
    })

    // 使用 async/await 风格进行翻译（获取详细信息）
    ;(async () => {
      try {
        console.log('[Content Script] 开始翻译:', text)
        // 发送翻译请求，请求详细信息
        const response = await sendMessage<WordPopupPayload | string>({
          action: 'translate',
          text: text,
          detailed: true, // 请求详细信息
        })

        console.log('[Content Script] 翻译成功，结果:', response.result)

        // 检查是否是详细翻译结果
        const result = response.result

        if (result && typeof result === 'object' && 'text' in result) {
          // 详细翻译结果
          const detailedResult = result as TranslationResult
          console.log('详细翻译结果', detailedResult)

          dispatchPopupEvent({
            classification: classification,
            position,
            context,
            source: window.location.hostname,
            ...detailedResult,
          })
        } else {
          // 简单文本结果（降级处理）
          console.log('[Content Script] 简单文本结果:', result)
          dispatchPopupEvent({
            classification: classification,
            original: text,
            context,
            source: window.location.hostname,
            position,
            text: result as string,
          })
        }
      } catch (error) {
        console.error('[Content Script] 翻译失败:', error)
        // 显示错误信息
        dispatchPopupEvent({
          classification: classification,
          original: text,
          context,
          source: window.location.hostname,
          position,
          text: '',
          error: (error as Error).message,
        })
      }
    })()

    // 翻译是在 IIFE 中异步进行的，不需要等待
    sendResponse({ success: true })
  }
}
