import {
  MessageAction,
  ChromeMessage,
  MessageResponse,
  TranslateRequest,
  TranslateResponse,
} from '@/types/messaging'

// 重新导出供外部使用
export type {
  MessageAction,
  ChromeMessage,
  MessageResponse,
  TranslateRequest,
  TranslateResponse,
}

// ==================== Tab 相关工具 ====================

export const queryActiveTab = (): Promise<chrome.tabs.Tab | undefined> =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs[0])
    })
  })

export const sendMessageToTab = <TResponse = unknown>(tabId: number, message: unknown): Promise<TResponse> =>
  new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: TResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }
      resolve(response as TResponse)
    })
  })

// ==================== 运行时消息传递 ====================

/**
 * Promise 风格的消息发送
 * @param message 要发送的消息
 * @returns Promise，解析为响应数据
 * @throws 如果消息发送失败或响应包含错误
 * 
 * @example
 * ```typescript
 * // 发送翻译请求
 * const response = await sendMessage<TranslateResponse>({
 *   action: 'translate',
 *   text: 'hello'
 * })
 * console.log(response.result) // 翻译结果
 * ```
 */
export async function sendMessage<T = any>(message: ChromeMessage): Promise<MessageResponse<T>> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      // 检查运行时错误
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      // 检查响应是否存在
      if (!response) {
        reject(new Error('未收到响应'))
        return
      }

      // 检查响应中的错误
      if (response.success === false && response.error) {
        reject(new Error(response.error))
        return
      }

      // 成功响应
      resolve(response as MessageResponse<T>)
    })
  })
}

/**
 * 发送翻译请求的便捷方法
 * @param text 要翻译的文本
 * @param detailed 是否返回详细信息（音标、定义等）
 * @returns Promise，解析为翻译结果
 * @throws 如果翻译失败
 */
export async function translateText(text: string, detailed: boolean = false): Promise<string> {
  const response = await sendMessage<string>({
    action: 'translate',
    text,
    detailed,
  })
  
  if (!response.result) {
    throw new Error('翻译结果为空')
  }
  
  return response.result
}

