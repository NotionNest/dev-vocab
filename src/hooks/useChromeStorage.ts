import { useEffect, useState } from 'react'
import type { LocalState, SyncConfig } from '../lib/utils/storage'
import {
  DEFAULT_LOCAL_STATE,
  DEFAULT_SYNC_CONFIG,
  getLocalState,
  getSyncConfig,
  setSyncConfig,
  updateLocalState,
} from '../lib/utils/storage'

const mergeWithDefaults = <T extends Record<string, unknown>>(
  prev: T | null,
  patch: Partial<T>,
  defaults: T,
): T => {
  const base = { ...(prev ?? defaults) }
  Object.entries(patch).forEach(([key, value]) => {
    ;(base as Record<string, unknown>)[key] =
      typeof value === 'undefined' ? (defaults as Record<string, unknown>)[key] : value
  })
  return base
}

export const useLocalState = () => {
  const [state, setState] = useState<LocalState | null>(null)

  useEffect(() => {
    let mounted = true
    getLocalState().then((data) => mounted && setState(data))

    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== 'local' || !mounted) return
      const patch: Partial<LocalState> = {}
      Object.entries(changes).forEach(([key, change]) => {
        ;(patch as Record<string, unknown>)[key] = change.newValue
      })
      setState((prev) => mergeWithDefaults(prev, patch, DEFAULT_LOCAL_STATE))
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      mounted = false
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const updateState = (partial: Partial<LocalState>) => {
    setState((prev) => mergeWithDefaults(prev, partial, DEFAULT_LOCAL_STATE))
    return updateLocalState(partial)
  }

  return { state, updateState }
}

export const useSyncConfig = () => {
  const [config, setConfig] = useState<SyncConfig | null>(null)

  useEffect(() => {
    let mounted = true
    getSyncConfig().then((data) => mounted && setConfig(data))

    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== 'sync' || !mounted) return
      const patch: Partial<SyncConfig> = {}
      Object.entries(changes).forEach(([key, change]) => {
        ;(patch as Record<string, unknown>)[key] = change.newValue
      })
      setConfig((prev) => mergeWithDefaults(prev, patch, DEFAULT_SYNC_CONFIG))
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      mounted = false
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const updateConfig = (partial: Partial<SyncConfig>) => {
    setConfig((prev) => mergeWithDefaults(prev, partial, DEFAULT_SYNC_CONFIG))
    return setSyncConfig(partial)
  }

  return { config, updateConfig }
}

