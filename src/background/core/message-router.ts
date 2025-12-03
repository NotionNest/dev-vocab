import { MessageHandler, MessagePayloadMap } from '../types'

// 注册的 handler 集合
const handlers: Partial<Record<keyof MessagePayloadMap, MessageHandler<any>>> =
  {}

/**
 * 注册某个业务模块的 handler
 */
export function registerHandler<T extends keyof MessagePayloadMap>(
  action: T,
  handler: MessageHandler<MessagePayloadMap[T]>
) {
  handlers[action] = handler
}

/**
 * 注册消息路由
 */
export function registerMessageRouter() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      // 必须具备基本结构 { action: string, payload?: any }
      if (!message || typeof message.action !== 'string') {
        console.log('Invalid message:', message)
        return
      }

      const action = message.action as keyof MessagePayloadMap
      const payload = message.payload

      const handler = handlers[action]

      if (!handler) {
        console.warn(`No handler registered for action: ${action}`)
        return
      }

      const result = handler(payload, sender)

      // 兼容同步 / 异步 handler
      if (result instanceof Promise) {
        result
          .then(res => sendResponse({ ok: true, data: res }))
          .catch(err => sendResponse({ ok: false, error: err?.message }))

        return true
      } else {
        // 同步响应
        sendResponse({ ok: true, data: result })
      }
    } catch (err: any) {
      console.error('Message router error:', err)
      sendResponse({ ok: false, error: err?.message })
    }
  })
}
