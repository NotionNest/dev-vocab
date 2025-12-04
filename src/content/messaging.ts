import { classifySelection } from '../lib/utils/word'
import type { WordPopupPayload } from '@/types/messaging'
import { TranslationResult } from '@/types/translation'
import { getContextFromSelection } from '../lib/utils/word'
import { MESSAGE } from '@/background/constants/message'

/**
 * 派发单词弹窗事件。
 * @param detail - 要派发的事件的详细信息。
 */
const dispatchPopupEvent = (detail: WordPopupPayload) => {
  window.dispatchEvent(new CustomEvent('devvocab:showPopup', { detail }))
}

export const handlers = {
  TRIGGER_WORD_CAPTURE: async () => {
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
    const basePayload = {
      classification: classification,
      context,
      source: window.location.hostname,
      position,
    }

    dispatchPopupEvent({
      status: 'loading',
      originalText: text,
      translatedText: '',
      ...basePayload,
    })
    try {
      console.log('[Content Script] 开始翻译:', text)
      // 先检查本地是否有单词
      const localWord = await chrome.runtime.sendMessage({
        action: MESSAGE.GET_WORD_BY_ORIGINAL,
        payload: {
          original: text,
        },
      })

      console.log('localWord', localWord)
      if (localWord.ok && localWord.data) {
        dispatchPopupEvent({
          status: 'reviewing',
          ...basePayload,
          ...localWord.data,
        })
        return
      }

      const response = await chrome.runtime.sendMessage({
        action: MESSAGE.TRANSLATE,
        payload: { text },
      })

      console.log('[Content Script] 翻译成功，结果:', response)
      // 检查是否是详细翻译结果
      const result = response.data

      const detailedResult = result as TranslationResult

      dispatchPopupEvent({
        status: 'capture',
        ...basePayload,
        ...detailedResult,
      })
    } catch (error) {
      console.error('[Content Script] 翻译失败:', error)
      // 显示错误信息
      dispatchPopupEvent({
        status: 'error',
        originalText: text,
        translatedText: '',
        ...basePayload,
      })
    }
  },
}
