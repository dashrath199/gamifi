"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { syncManager } from "@/lib/offline/sync-manager"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncManager.syncOfflineData()
    } catch (error) {
      console.error("Manual sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {isOnline && (
        <Button variant="ghost" size="sm" onClick={handleSync} disabled={isSyncing} className="h-6 px-2">
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  )
}
