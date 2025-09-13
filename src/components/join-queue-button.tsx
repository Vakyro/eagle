"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface JoinQueueButtonProps {
  serviceId: string
  serviceName: string
  serviceType: string
}

interface QueueData {
  serviceId: string
  serviceName: string
  serviceType: string
  joinedAt: string
  position: number
  estimatedWait: number
  qrCode: string
}

export function JoinQueueButton({ serviceId, serviceName, serviceType }: JoinQueueButtonProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [currentQueues, setCurrentQueues] = useState<QueueData[]>([])
  const [canJoin, setCanJoin] = useState(true)
  const [restrictionMessage, setRestrictionMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadCurrentQueues = () => {
      const stored = localStorage.getItem("userQueues")
      if (stored) {
        const queues = JSON.parse(stored)
        setCurrentQueues(queues)

        // Check if already in this queue
        const alreadyInQueue = queues.some((q: QueueData) => q.serviceId === serviceId)
        if (alreadyInQueue) {
          setCanJoin(false)
          setRestrictionMessage("You're already in this queue")
          return
        }

        // Check restaurant queue limit (max 2 restaurants)
        const restaurantQueues = queues.filter((q: QueueData) => q.serviceType.toLowerCase() === "restaurant")

        if (serviceType.toLowerCase() === "restaurant" && restaurantQueues.length >= 2) {
          setCanJoin(false)
          setRestrictionMessage("You can only join up to 2 restaurant queues at once")
          return
        }

        // Check total queue limit (max 5 total)
        if (queues.length >= 5) {
          setCanJoin(false)
          setRestrictionMessage("You can only join up to 5 queues at once")
          return
        }
      }
    }

    loadCurrentQueues()
  }, [serviceId, serviceType])

  const handleJoinQueue = async () => {
    if (!canJoin) return

    setIsJoining(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newQueueData: QueueData = {
      serviceId,
      serviceName,
      serviceType,
      joinedAt: new Date().toISOString(),
      position: Math.floor(Math.random() * 5) + 1,
      estimatedWait: Math.floor(Math.random() * 20) + 5,
      qrCode: `queue-${serviceId}-${Date.now()}`,
    }

    const updatedQueues = [...currentQueues, newQueueData]
    localStorage.setItem("userQueues", JSON.stringify(updatedQueues))

    // Keep backward compatibility with single queue
    localStorage.setItem("currentQueue", JSON.stringify(newQueueData))

    setIsJoining(false)
    router.push("/my-queue")
  }

  if (!canJoin) {
    return (
      <div className="space-y-3">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">{restrictionMessage}</AlertDescription>
        </Alert>
        <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
          Cannot Join Queue
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleJoinQueue}
      disabled={isJoining}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
    >
      {isJoining ? "Joining Queue..." : "Join Queue"}
    </Button>
  )
}
