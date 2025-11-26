import {
  DEFAULT_LOCAL_STATE,
  DEFAULT_SYNC_CONFIG,
  LocalState,
  setSyncConfig,
  updateLocalState,
} from '@/lib/utils/storage'
import { translate, translateDetailed } from '@/lib/utils/translate'
import {
  getVocabularyEntries,
  saveVocabularyEntries,
  VocabularyEntry,
} from '@/lib/utils/vocabulary'
import { WordPopupPayload } from '@/types'

type BackgroundMessage =
  | { action: 'getLocalState' }
  | { action: 'openTab'; url: string }
  | { action: 'addToVocabulary'; detail: WordPopupPayload }
  | { action: 'openOptionsPage' }
  | { action: 'translate'; text: string; detailed?: boolean }

/**
 * 创建右键菜单项
 */
const ensureContextMenus = () => {
  // 检查 contextMenus API 是否可用
  if (!chrome.contextMenus) {
    console.warn('⚠️ contextMenus API 不可用，跳过右键菜单创建')
    return
  }

  try {
    chrome.contextMenus.create(
      {
        id: 'search-selection',
        title: '使用扩展记录 "%s"',
        contexts: ['selection'],
      },
      () => {
        const error = chrome.runtime.lastError
        if (error) {
          console.error('创建右键菜单失败', error)
        } else {
          console.log('创建右键菜单成功')
        }
      }
    )
  } catch (error) {
    console.error('创建右键菜单失败', error)
  }
}

/**
 * 监听扩展安装/更新事件
 * @param {chrome.runtime.InstalledDetails} details - 安装/更新事件详情
 * @returns {void}
 */
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

      ensureContextMenus()
    } catch (error) {
      console.error('初始化失败', error)
    }
  }
)

/**
 * 当安装了此扩展程序的个人资料首次启动时触发
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('⚙️ 扩展后台启动')
  ensureContextMenus()
})

/**
 * 监听后台消息
 * @param {BackgroundMessage} request - 消息请求
 * @param {chrome.runtime.MessageSender} _sender - 消息发送者
 * @param {function} sendResponse - 发送响应函数
 * @returns {boolean} - 是否继续处理
 */
chrome.runtime.onMessage.addListener(
  (
    request: BackgroundMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    console.log('收到消息:', request)
    if (request.action === 'getLocalState') {
      chrome.storage.local.get(DEFAULT_LOCAL_STATE, (data: LocalState) => {
        sendResponse(data)
      })
      return true
    }

    if (request.action === 'openTab' && request.url) {
      chrome.tabs.create({ url: request.url })
      sendResponse({ success: true })
    }

    if (request.action === 'openOptionsPage') {
      chrome.runtime.openOptionsPage()
      sendResponse({ success: true })
    }
    if (request.action === 'addToVocabulary' && request.detail) {
      ;(async () => {
        try {
          const existingEntries = await getVocabularyEntries()
          const newEntry: VocabularyEntry = {
            ...request.detail,
            savedAt: new Date().toISOString(),
            id: new Date().getTime().toString(),
          }

          const duplicateIndex = existingEntries.findIndex(
            entry =>
              entry.original === newEntry.original &&
              entry.source === newEntry.source
          )
          const updatedEntries =
            duplicateIndex > -1
              ? existingEntries.map((entry, index) =>
                  index === duplicateIndex ? newEntry : entry
                )
              : [newEntry, ...existingEntries]

          await saveVocabularyEntries(updatedEntries)
          // await syncVocabularyToRemote(newEntry)

          // 通知侧边栏触发更新
          chrome.runtime.sendMessage({ action: 'updateVocabulary' })

          sendResponse({ success: true, data: newEntry })
        } catch (error) {
          console.error('保存单词失败:', error)
          sendResponse({ success: false, error: (error as Error).message })
        }
      })()

      return true
    }

    if (request.action === 'translate' && request.text) {
      // 使用 IIFE 处理异步逻辑
      ;(async () => {
        try {
          // 获取目标语言设置
          const storageData = await chrome.storage.local.get('targetLanguage')
          const targetLang = (storageData.targetLanguage as string) || 'zh-CN'

          // 根据是否请求详细信息使用不同的翻译方法
          if (request.detailed) {
            // 返回详细的翻译结果（包含音标、定义等）
            const detailedResult = await translateDetailed(
              request.text,
              targetLang
            )
            sendResponse({ success: true, result: detailedResult })
          } else {
            // 返回简单的文本翻译
            const result = await translate(request.text, targetLang)
            sendResponse({ success: true, result })
          }
        } catch (error) {
          console.error('翻译失败:', error)
          sendResponse({ success: false, error: (error as Error).message })
        }
      })()

      return true // 保持消息通道打开
    }

    return false
  }
)

if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener(
    (info: chrome.contextMenus.OnClickData) => {
      if (info.menuItemId === 'search-selection' && info.selectionText) {
        chrome.tabs.create({
          url: `https://www.google.com/search?q=${encodeURIComponent(
            info.selectionText
          )}`,
        })
      }
    }
  )
} else {
  console.warn('⚠️ contextMenus API 不可用，跳过右键菜单监听')
}

let currentWindowId: number | null = null
chrome.windows.onFocusChanged.addListener(winId => {
  if (winId !== chrome.windows.WINDOW_ID_NONE) {
    currentWindowId = winId
  }
})

/**
 * 侧边面板打开状态
 */
let isSidePanelOpen = false

/**
 * 监听快捷键
 * @param {string} command - 命令
 * @returns {void}
 */
chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === 'add_to_wordbook') {
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

    try {
      // 发送消息到 content script
      chrome.tabs.sendMessage(tab.id, { action: 'translate' })
    } catch (error) {
      console.error('发送消息时出错:', error)
    }
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

/**
 * 处理 @crxjs/vite-plugin 的 HMR 连接
 */
chrome.runtime.onConnect.addListener(port => {
  console.log('Port connected:', port.name)

  // 处理 @crxjs/vite-plugin 的 HMR 连接
  if (port.name === '@crx/client') {
    // 保持连接活跃，处理消息
    port.onMessage.addListener(message => {
      // 可以在这里处理 HMR 消息
      if (message.type === 'connected') {
        console.log('[HMR] Client connected')
      }
    })

    port.onDisconnect.addListener(() => {
      console.log('[HMR] Client disconnected')
    })
  }
})
