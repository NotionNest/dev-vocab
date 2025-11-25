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

