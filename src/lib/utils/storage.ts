export const DEFAULT_SYNC_CONFIG = {
  flotingBtn: true,
}
export const DEFAULT_LOCAL_STATE = {
  installDate: '',
  version: '',
  lastUpdatedAt: '',
}

export type SyncConfig = typeof DEFAULT_SYNC_CONFIG
export type LocalState = typeof DEFAULT_LOCAL_STATE

export const getSyncConfig = (): Promise<SyncConfig> =>
  new Promise(resolve => {
    chrome.storage.sync.get(DEFAULT_SYNC_CONFIG, (config: unknown) => {
      resolve((config as SyncConfig) ?? DEFAULT_SYNC_CONFIG)
    })
  })

export const setSyncConfig = (config: Partial<SyncConfig>) =>
  new Promise<void>(resolve => {
    chrome.storage.sync.set(config, () => resolve())
  })

export const getLocalState = (): Promise<LocalState> =>
  new Promise(resolve => {
    chrome.storage.local.get(DEFAULT_LOCAL_STATE, (state: unknown) => {
      resolve((state as LocalState) ?? DEFAULT_LOCAL_STATE)
    })
  })

export const updateLocalState = (state: Partial<LocalState>) =>
  new Promise<void>(resolve => {
    chrome.storage.local.set(state, () => resolve())
  })
