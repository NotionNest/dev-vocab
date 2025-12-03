import { sendToTab } from '../utils/tab'
import {
  DEFAULT_LOCAL_STATE,
  DEFAULT_SYNC_CONFIG,
  setSyncConfig,
  updateLocalState,
} from '@/lib/utils/storage'

let isSidePanelOpen = false
let currentWindowId: number | null = null

export function registerSystemEvents() {
  chrome.windows.onFocusChanged.addListener(winId => {
    if (winId !== chrome.windows.WINDOW_ID_NONE) {
      currentWindowId = winId
    }
  })

  // 快捷键（commands）
  chrome.commands.onCommand.addListener(async (command: string) => {
    if (command === 'command_word_capture') {
      console.log('快捷键触发：Ctrl+Shift+Y')

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (!tab?.id || !tab.url) return

      // 检查是否是特殊页面（chrome://, edge:// 等），这些页面无法注入 content script
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:')
      ) {
        console.warn('无法在特殊页面上使用此功能')
        return
      }

      // 向 content script 发送消息，触发翻译
      sendToTab(tab.id, { action: 'TRIGGER_WORD_CAPTURE' })
    }
    if (command === 'toggle_sidepanel') {
      console.log('快捷键触发：Ctrl+Shift+L')
      if (isSidePanelOpen) {
        chrome.sidePanel.setOptions({
          enabled: false,
          path: 'src/sidepanel/blank.html',
        })
        isSidePanelOpen = false
      } else {
        chrome.sidePanel.setOptions({
          enabled: true,
          path: 'src/sidepanel/index.html',
        })
        currentWindowId && chrome.sidePanel.open({ windowId: currentWindowId })
        isSidePanelOpen = true
      }
    }
  })

  // 扩展安装/更新
  chrome.runtime.onInstalled.addListener(
    async (details: chrome.runtime.InstalledDetails) => {
      console.log('🚀 扩展安装/更新事件', details.reason)

      try {
        if (details.reason === 'install') {
          await updateLocalState({
            ...DEFAULT_LOCAL_STATE,
            installDate: new Date().toISOString(),
            version: chrome.runtime.getManifest().version,
          })
          await setSyncConfig(DEFAULT_SYNC_CONFIG)

          if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage()
          } else {
            chrome.tabs.create({
              url: chrome.runtime.getURL('src/options/index.html'),
            })
          }
        }

        if (details.reason === 'update') {
          await updateLocalState({
            version: chrome.runtime.getManifest().version,
            lastUpdatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('初始化失败', error)
      }
    }
  )
}
