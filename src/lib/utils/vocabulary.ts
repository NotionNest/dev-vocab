import { WordPopupPayload } from "@/types"

export type VocabularyEntry = WordPopupPayload & {
  savedAt: string
  id: string
}

const VOCABULARY_STORAGE_KEY = 'devVocabVocabulary'

export const getVocabularyEntries = (): Promise<VocabularyEntry[]> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get([VOCABULARY_STORAGE_KEY], result => {
      const error = chrome.runtime.lastError
      if (error) {
        reject(error)
        return
      }
      const entries = result[VOCABULARY_STORAGE_KEY]
      resolve(Array.isArray(entries) ? (entries as VocabularyEntry[]) : [])
    })
  })

export const saveVocabularyEntries = (entries: VocabularyEntry[]): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set(
      { [VOCABULARY_STORAGE_KEY]: entries },
      () => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(error)
          return
        }
        resolve()
      }
    )
  })

export const syncVocabularyToRemote = async (_entry: VocabularyEntry) => {
  // TODO: 保留 Notion/远程同步逻辑占位
}
