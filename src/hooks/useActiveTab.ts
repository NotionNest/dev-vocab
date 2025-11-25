import { useEffect, useState } from 'react'
import { queryActiveTab } from '../lib/utils/chrome'

export type ActiveTab = {
  id?: number
  title?: string
  url?: string
}

export const useActiveTab = () => {
  const [tab, setTab] = useState<ActiveTab>({})

  useEffect(() => {
    queryActiveTab().then((active) => {
      setTab({
        id: active?.id,
        title: active?.title,
        url: active?.url,
      })
    })

    const listener = (activeInfo: chrome.tabs.OnActivatedInfo) => {
      chrome.tabs.get(activeInfo.tabId, (updatedTab: chrome.tabs.Tab) => {
        setTab({
          id: updatedTab?.id,
          title: updatedTab?.title,
          url: updatedTab?.url,
        })
      })
    }

    chrome.tabs.onActivated.addListener(listener)

    const handleUpdated = (_tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tabInfo: chrome.tabs.Tab) => {
      if (tabInfo.active && changeInfo.status === 'complete') {
        setTab({
          id: tabInfo.id,
          title: tabInfo.title,
          url: tabInfo.url,
        })
      }
    }

    chrome.tabs.onUpdated.addListener(handleUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(listener)
      chrome.tabs.onUpdated.removeListener(handleUpdated)
    }
  }, [])

  return tab
}

