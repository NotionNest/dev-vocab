const DB_NAME = 'vocab-db'
const DB_VERSION = 1

export class DB {
  private db: IDBDatabase | null = null

  /**
   * 打开数据库
   * @returns Promise<IDBDatabase> - 返回数据库实例
   */
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
          // 创建索引
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('originalText', 'originalText', { unique: false })
          store.createIndex('nextReviewAt', 'nextReviewAt', { unique: false })
        }
      }
    })
  }

  /**
   * 获取存储对象
   * @param storeName - 存储对象的名称
   * @param mode - 存储对象的模式
   * @returns IDBObjectStore - 返回存储对象
   */
  getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.transaction(storeName, mode).objectStore(storeName)
  }
}

export const dbInstance = new DB()
