const DB_NAME = 'vocab-db'
const DB_VERSION = 1

export class DB {
  private db: IDBDatabase | null = null

  open() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      // 第一次创建 & 版本升级
      request.onupgradeneeded = () => {
        const db = request.result

        // 创建 vocab 表 (key 为 id)
        if (!db.objectStoreNames.contains('vocabs')) {
          const store = db.createObjectStore('vocabs', { keyPath: 'id' })
          store.createIndex('text', 'text', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.transaction(storeName, mode).objectStore(storeName)
  }
}

export const dbInstance = new DB()
