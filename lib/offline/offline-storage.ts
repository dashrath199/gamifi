// IndexedDB wrapper for offline data storage
class OfflineStorage {
  private dbName = "gamified-learning-offline"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("lessons")) {
          const lessonStore = db.createObjectStore("lessons", { keyPath: "id" })
          lessonStore.createIndex("courseId", "courseId", { unique: false })
        }

        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", { keyPath: "id" })
          progressStore.createIndex("studentId", "studentId", { unique: false })
          progressStore.createIndex("lessonId", "lessonId", { unique: false })
        }

        if (!db.objectStoreNames.contains("subjects")) {
          db.createObjectStore("subjects", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("courses")) {
          const courseStore = db.createObjectStore("courses", { keyPath: "id" })
          courseStore.createIndex("subjectId", "subjectId", { unique: false })
        }

        if (!db.objectStoreNames.contains("sync_queue")) {
          const syncStore = db.createObjectStore("sync_queue", { keyPath: "id", autoIncrement: true })
          syncStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  async storeLesson(lesson: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["lessons"], "readwrite")
      const store = transaction.objectStore("lessons")
      const request = store.put(lesson)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getLesson(id: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["lessons"], "readonly")
      const store = transaction.objectStore("lessons")
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async storeCourse(course: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["courses"], "readwrite")
      const store = transaction.objectStore("courses")
      const request = store.put(course)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getCoursesBySubject(subjectId: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["courses"], "readonly")
      const store = transaction.objectStore("courses")
      const index = store.index("subjectId")
      const request = index.getAll(subjectId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async storeProgress(progress: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["progress"], "readwrite")
      const store = transaction.objectStore("progress")
      const request = store.put(progress)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getProgressByStudent(studentId: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["progress"], "readonly")
      const store = transaction.objectStore("progress")
      const index = store.index("studentId")
      const request = index.getAll(studentId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async addToSyncQueue(data: any): Promise<void> {
    if (!this.db) await this.init()

    const syncItem = {
      ...data,
      timestamp: Date.now(),
      synced: false,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readwrite")
      const store = transaction.objectStore("sync_queue")
      const request = store.add(syncItem)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readonly")
      const store = transaction.objectStore("sync_queue")
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async removeSyncItem(id: number): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readwrite")
      const store = transaction.objectStore("sync_queue")
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const offlineStorage = new OfflineStorage()
