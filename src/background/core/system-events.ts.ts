import { getWordsDueForReview } from '../features/words/service'
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

  chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('checkReview', {
      periodInMinutes: 1, // 每分钟扫描一次
    })
  })

  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name !== 'checkReview') return
    const dueWords = await getWordsDueForReview()

    if (dueWords.length === 0) {
      // 如果没有待复习单词，清空已通知列表
      await chrome.storage.local.remove('notifiedReviewWordIds')
      return
    }

    // 记录待复习的单词  如果是已经通知过的单词 那么不重复通知 如果有新的待复习单词 那么通知
    const storageData = await chrome.storage.local.get('notifiedReviewWordIds')
    const notifiedWordIds = new Set<string>(
      (storageData.notifiedReviewWordIds as string[]) || []
    )

    // 获取当前待复习单词的ID集合
    const currentDueWordIds = new Set(dueWords.map(word => word.id))

    // 找出新的待复习单词（之前没有通知过的）
    const newDueWords = dueWords.filter(word => !notifiedWordIds.has(word.id))

    // 清理已通知列表中那些已经不在待复习列表中的单词ID（因为它们可能已经被复习过了）
    const updatedNotifiedIds = Array.from(notifiedWordIds).filter(id =>
      currentDueWordIds.has(id)
    )

    // 如果有新的待复习单词，才发送通知
    if (newDueWords.length > 0) {
      console.log(`发现 ${newDueWords.length} 个新的待复习单词`)

      // 1. 推送系统通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon128.png'),
        title: '复习时间到啦 📘',
        message: `你有 ${newDueWords.length} 个新单词需要复习, 共 ${dueWords.length} 待复习`,
        priority: 2,
      })

      // 2. 通过 storage 事件通知 sidepanel / popup
      // 使用 storage 事件可以确保即使 sidepanel 还没打开，消息也不会丢失
      chrome.storage.local.set({
        reviewDueNotification: {
          timestamp: Date.now(),
          count: dueWords.length,
          newCount: newDueWords.length,
          words: dueWords,
          newWords: newDueWords,
        },
      })

      // 3. 更新已通知单词ID列表（添加新的单词ID）
      updatedNotifiedIds.push(...newDueWords.map(word => word.id))
      await chrome.storage.local.set({
        notifiedReviewWordIds: updatedNotifiedIds,
      })
    } else {
      // 没有新单词，但更新已通知列表（清理已复习的单词）
      await chrome.storage.local.set({
        notifiedReviewWordIds: updatedNotifiedIds,
      })
    }
  })

  chrome.notifications.onClicked.addListener(notificationId => {
    console.log('notification clicked', notificationId)
    currentWindowId && chrome.sidePanel.open({ windowId: currentWindowId })
    // 关闭通知
    chrome.notifications.clear(notificationId)
  })
}
