import { dbInstance } from './index'
import { WordItem } from './schema'

export const vocabDB = {
  async addWord(item: WordItem) {
    const db = await dbInstance.open()
    const store = db.transaction('vocabs', 'readwrite').objectStore('vocabs')

    return new Promise((resolve, reject) => {
      const req = store.add(item)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async getAllWords(): Promise<WordItem[]> {
    const db = await dbInstance.open()
    const store = db.transaction('vocabs', 'readonly').objectStore('vocabs')

    return new Promise((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async getWordById(id: string): Promise<WordItem | undefined> {
    const db = await dbInstance.open()
    const store = db.transaction('vocabs', 'readonly').objectStore('vocabs')

    return new Promise((resolve, reject) => {
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async updateWord(id: string, data: Partial<WordItem>) {
    const old = await this.getWordById(id)
    if (!old) throw new Error('Word not found')

    const updated = { ...old, ...data }

    const db = await dbInstance.open()
    const store = db.transaction('vocabs', 'readwrite').objectStore('vocabs')

    return new Promise((resolve, reject) => {
      const req = store.put(updated)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async removeWord(id: string) {
    const db = await dbInstance.open()
    const store = db.transaction('vocabs', 'readwrite').objectStore('vocabs')

    return new Promise((resolve, reject) => {
      const req = store.delete(id)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },
}

export const dbOperations = {
  // 通过 id 获取 下标
  async getIndexById(id: string): Promise<number> {
    const words = await vocabDB.getAllWords()
    const index = words.findIndex(word => word.id === id)
    return index
  },

  // 通过 original 获取
  async getWordByOriginal(original: string): Promise<WordItem | undefined> {
    const words = await vocabDB.getAllWords()
    const word = words.find(word => word.original === original)
    return word
  },

  // 增加遇到次数
  async increaseCount(id: string) {
    const word = await vocabDB.getWordById(id)
    if (!word) throw new Error('Word not found')
    await vocabDB.updateWord(id, { count: word.count + 1 })
  },
}
