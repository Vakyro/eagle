"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, X, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"

interface QueueUpdate {
  type: "position_change" | "called" | "almost_ready" | "service_closed"
  message: string
  data?: any
}

interface NotificationBannerProps {
  updates: QueueUpdate[]
  onClearUpdates: () => void
  onRequestPermission: () => void
}

export function NotificationBanner({ updates, onClearUpdates, onRequestPermission }: NotificationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" ? Notification.permission : "default",
  )

  const latestUpdate = updates[updates.length - 1]

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "called":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "almost_ready":
        return <AlertCircle className="w-5 h-5 text-[#ddc248]" />
      case "position_change":
        return <Clock className="w-5 h-5 text-[#2772ce]" />
      default:
        return <Bell className="w-5 h-5 text-[#2772ce]" />
    }
  }

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "called":
        return "bg-green-50 border-green-200"
      case "almost_ready":
        return "bg-[#ddc248]/10 border-[#ddc248]/30"
      case "service_closed":
        return "bg-[#9b5824]/10 border-[#9b5824]/30"
      default:
        return "bg-[#2772ce]/10 border-[#2772ce]/30"
    }
  }

  if (updates.length === 0 && notificationPermission === "granted") {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Notification Permission Banner */}
      {notificationPermission !== "granted" && (
        <Card className="bg-[#2772ce]/10 border-[#2772ce]/30 border shadow-sm rounded-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#2772ce]" />
                <div>
                  <div className="font-medium text-[#050315]">Enable Notifications</div>
                  <div className="text-sm text-[#050315]/70">Get notified when your turn is near</div>
                </div>
              </div>
              <Button onClick={onRequestPermission} size="sm" className="bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
                Enable
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Updates Banner */}
      {latestUpdate && (
        <Card className={`border shadow-sm rounded-xl overflow-hidden ${getUpdateColor(latestUpdate.type)}`}>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getUpdateIcon(latestUpdate.type)}
                <div className="flex-1">
                  <div className="font-medium text-[#050315] text-sm leading-relaxed">{latestUpdate.message}</div>
                  {updates.length > 1 && (
                    <Button
                      onClick={() => setIsExpanded(!isExpanded)}
                      variant="ghost"
                      size="sm"
                      className="text-[#050315]/70 hover:text-[#050315] p-0 h-auto mt-1"
                    >
                      {isExpanded ? "Show less" : `View ${updates.length - 1} more updates`}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={onClearUpdates}
                variant="ghost"
                size="sm"
                className="text-[#050315]/50 hover:text-[#050315] p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Expanded Updates */}
            {isExpanded && updates.length > 1 && (
              <div className="mt-4 pt-4 border-t border-[#050315]/10 space-y-3">
                {updates
                  .slice(0, -1)
                  .reverse()
                  .map((update, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {getUpdateIcon(update.type)}
                      <div className="text-sm text-[#050315]/80 leading-relaxed">{update.message}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
