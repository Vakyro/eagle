"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Users, RefreshCw, Bell, Wifi } from "lucide-react"
import { useState } from "react"

interface QueueData {
  serviceId: string
  serviceName: string
  joinedAt: string
  position: number
  estimatedWait: number
  qrCode: string
}

interface QueueStatusProps {
  queueData: QueueData
  onRefresh: () => void
}

export function QueueStatus({ queueData, onRefresh }: QueueStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const joinedTime = new Date(queueData.joinedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    onRefresh()
    // Simulate network delay
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getStatusMessage = () => {
    if (queueData.position === 1) {
      return "You're next! Please be ready to proceed."
    } else if (queueData.position <= 3) {
      return "You're almost up! Please stay nearby."
    } else if (queueData.position <= 10) {
      return "Your turn is coming soon. We'll notify you when it's close."
    } else {
      return "Please wait for your turn. We'll keep you updated on your progress."
    }
  }

  const getStatusColor = () => {
    if (queueData.position === 1) return "bg-green-500/10 border-green-500/20"
    if (queueData.position <= 3) return "bg-[#ddc248]/20 border-[#ddc248]/30"
    return "bg-[#2772ce]/10 border-[#2772ce]/20"
  }

  return (
    <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#050315]">{queueData.serviceName}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[#050315]/50">
              <Wifi className="w-3 h-3" />
              <span>Live</span>
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-[#2772ce] hover:bg-[#2772ce]/10"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center bg-[#2772ce]/10 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#2772ce]" />
            </div>
            <div className="text-2xl font-bold text-[#050315]">#{queueData.position}</div>
            <div className="text-sm text-[#050315]/70">position in line</div>
          </div>

          <div className="text-center bg-[#ddc248]/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#050315]" />
            </div>
            <div className="text-2xl font-bold text-[#050315]">{queueData.estimatedWait}</div>
            <div className="text-sm text-[#050315]/70">minutes left</div>
          </div>
        </div>

        <div className={`rounded-lg p-4 mb-4 border ${getStatusColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-[#2772ce]" />
            <span className="text-sm font-medium text-[#050315]">Status Update</span>
          </div>
          <p className="text-sm text-[#050315]/70 leading-relaxed">{getStatusMessage()}</p>
        </div>

        <div className="text-xs text-[#050315]/50 text-center">
          Joined at {joinedTime} • Last updated:{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </Card>
  )
}
