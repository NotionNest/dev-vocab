import { Classification, classifySelection } from './word'

type ChangeBackgroundMessage = {
  action: 'changeBackground'
}

type PingMessage = {
  action: 'ping'
}

type AddToWordbookMessage = {
  action: 'addToWordbook'
  text: string
}

export type ExtensionMessage =
  | ChangeBackgroundMessage
  | PingMessage
  | AddToWordbookMessage

export type WordPopupPayload = {
  classification: Classification
  content: string // 内容
  context: string // 上下文句子
  definition?: string // 释义
  source?: string // 来源
  position?: { x: number; y: number } // 位置
  error?: string // 错误信息
}

export const WORD_POPUP_EVENT = 'devvocab:showPopup'

/**
 * 派发单词弹窗事件。
 * @param detail - 要派发的事件的详细信息。
 */
const dispatchPopupEvent = (detail: WordPopupPayload) => {
  window.dispatchEvent(new CustomEvent(WORD_POPUP_EVENT, { detail }))
}

/**
 * 从 selection 中提取上下文句子。
 * @param selection - 要提取上下文句子的 selection 对象。
 * @returns 上下文句子字符串。
 */
const extractContextSentence = (selection: Selection): string => {
  if (selection.rangeCount === 0) {
    return ''
  }

  const range = selection.getRangeAt(0)
  const container = range.startContainer
  const textContent =
    (container.nodeType === Node.TEXT_NODE
      ? container.textContent
      : container.textContent) ?? ''

  if (!textContent) {
    return ''
  }

  const startBoundary = Math.max(
    0,
    textContent.lastIndexOf('.', Math.max(range.startOffset - 1, 0)) + 1
  )
  const endBoundaryRaw = textContent.indexOf('.', range.endOffset)
  const endBoundary =
    endBoundaryRaw === -1 ? textContent.length : endBoundaryRaw + 1

  return textContent.slice(startBoundary, endBoundary).trim()
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

  if (request.action === 'addToWordbook') {
    const selection = window.getSelection()
    const text = selection?.toString().trim() ?? ''

    if (!selection || !text) return

    const classification = classifySelection(text)

    // 获取上下文句子
    const context =
      extractContextSentence(selection) ??
      selection?.anchorNode?.textContent?.trim() ??
      ''

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
      content: text,
      context,
      definition: '',
      source: window.location.hostname,
      position,
    })

    chrome.runtime.sendMessage(
      {
        action: 'translate',
        text: text,
      },
      response => {
        if (response.success) {
          setTimeout(() => {
            dispatchPopupEvent({
              classification: classification,
              content: text,
              context,
              definition: '释义获取成功',
              source: window.location.hostname,
              position,
            })
          }, 2000)
        } else {
          console.error('翻译失败', response.error)
        }
      }
    )

    sendResponse({ success: true })
    return
  }
}
