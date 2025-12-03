import {
  getLocalState,
  getSyncConfig,
  LocalState,
  SyncConfig,
} from '@/lib/utils/storage'

/**
 * 打开选项页面
 */
export async function openOptionsPage(): Promise<void> {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/options/index.html'),
    })
  }
}

/**
 * 获取系统设置
 * 包括本地状态和同步配置
 */
export async function getSettings(): Promise<{
  localState: LocalState
  syncConfig: SyncConfig
}> {
  const [localState, syncConfig] = await Promise.all([
    getLocalState(),
    getSyncConfig(),
  ])

  return {
    localState,
    syncConfig,
  }
}

