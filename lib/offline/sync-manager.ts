import { offlineStorage } from "./offline-storage"
import { createClient } from "@/lib/supabase/client"

class SyncManager {
  private isOnline = true
  private syncInProgress = false

  constructor() {
    // Monitor online/offline status
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))
    }
  }

  private handleOnline() {
    this.isOnline = true
    console.log("Connection restored - starting sync")
    this.syncOfflineData()
  }

  private handleOffline() {
    this.isOnline = false
    console.log("Connection lost - switching to offline mode")
  }

  async saveProgressOffline(progressData: any): Promise<void> {
    try {
      // Store progress locally
      await offlineStorage.storeProgress(progressData)

      // Add to sync queue if offline
      if (!this.isOnline) {
        await offlineStorage.addToSyncQueue({
          type: "progress",
          action: "upsert",
          data: progressData,
        })
      } else {
        // Try to sync immediately if online
        await this.syncProgressData(progressData)
      }
    } catch (error) {
      console.error("Failed to save progress offline:", error)
      throw error
    }
  }

  async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return
    }

    this.syncInProgress = true

    try {
      const syncQueue = await offlineStorage.getSyncQueue()
      console.log(`Syncing ${syncQueue.length} items`)

      for (const item of syncQueue) {
        try {
          await this.syncItem(item)
          await offlineStorage.removeSyncItem(item.id)
          console.log(`Synced item ${item.id}`)
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error)
          // Continue with other items
        }
      }
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncItem(item: any): Promise<void> {
    const supabase = createClient()

    switch (item.type) {
      case "progress":
        await this.syncProgressData(item.data)
        break
      case "points":
        await this.syncPointsData(item.data)
        break
      default:
        console.warn(`Unknown sync item type: ${item.type}`)
    }
  }

  private async syncProgressData(progressData: any): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.from("student_progress").upsert(progressData)

    if (error) {
      throw error
    }
  }

  private async syncPointsData(pointsData: any): Promise<void> {
    const supabase = createClient()

    // Update student points using the stored procedure
    const { error } = await supabase.rpc("update_student_points", {
      p_student_id: pointsData.student_id,
      p_points_to_add: pointsData.points_to_add,
    })

    if (error) {
      throw error
    }
  }

  async cacheContentForOffline(studentId: string, gradeLevel: number): Promise<void> {
    try {
      const supabase = createClient()

      // Cache subjects
      const { data: subjects } = await supabase.from("subjects").select("*")

      if (subjects) {
        for (const subject of subjects) {
          await offlineStorage.storeCourse(subject)
        }
      }

      // Cache courses for the student's grade level
      const { data: courses } = await supabase
        .from("courses")
        .select(`
          *,
          lessons (*)
        `)
        .eq("grade_level", gradeLevel)
        .eq("is_active", true)

      if (courses) {
        for (const course of courses) {
          await offlineStorage.storeCourse(course)

          // Cache individual lessons
          if (course.lessons) {
            for (const lesson of course.lessons) {
              await offlineStorage.storeLesson(lesson)
            }
          }
        }
      }

      // Cache student progress
      const { data: progress } = await supabase.from("student_progress").select("*").eq("student_id", studentId)

      if (progress) {
        for (const progressItem of progress) {
          await offlineStorage.storeProgress(progressItem)
        }
      }

      console.log("Content cached for offline use")
    } catch (error) {
      console.error("Failed to cache content:", error)
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline
  }
}

export const syncManager = new SyncManager()
