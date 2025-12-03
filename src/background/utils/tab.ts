/**
 * 发送消息到指定标签页
 * @param tabId - 要发送消息的标签页的 ID
 * @param message - 要发送的消息
 * @returns Promise<T | null> - 返回消息的响应
 */
export async function sendToTab<T = any>(
  tabId: number,
  message: any
): Promise<T | null> {
  return new Promise(resolve => {
    try {
      chrome.tabs.sendMessage(tabId, message, response => {
        const lastError = chrome.runtime.lastError
        if (lastError) {
          // 通常是 content script 不在该 tab 中
          resolve(null)
        } else {
          resolve(response as T)
        }
      })
    } catch (e) {
      resolve(null)
    }
  })
}
