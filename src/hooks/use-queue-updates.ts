"use client"

import { useState, useEffect, useCallback } from "react"

interface QueueData {
  serviceId: string
  serviceName: string
  joinedAt: string
  position: number
  estimatedWait: number
  qrCode: string
}

interface QueueUpdate {
  type: "position_change" | "called" | "almost_ready" | "service_closed"
  message: string
  data?: any
}

export function useQueueUpdates(queueData: QueueData | null) {
  const [updates, setUpdates] = useState<QueueUpdate[]>([])
  const [lastPosition, setLastPosition] = useState<number | null>(null)

  const addUpdate = useCallback((update: QueueUpdate) => {
    setUpdates((prev) => [...prev.slice(-4), update]) // Keep last 5 updates

    // Show browser notification if supported and permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Eagle Update", {
        body: update.message,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "queue-update",
      })
    }
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (!queueData) return

    const interval = setInterval(() => {
      const currentPosition = queueData.position

      // Simulate position changes
      const shouldUpdate = Math.random() < 0.3 // 30% chance of update

      if (shouldUpdate && currentPosition > 1) {
        const newPosition = Math.max(1, currentPosition - Math.floor(Math.random() * 2 + 1))
        const newEstimatedWait = Math.max(2, queueData.estimatedWait - Math.floor(Math.random() * 5 + 2))

        // Update localStorage
        const updatedData = {
          ...queueData,
          position: newPosition,
          estimatedWait: newEstimatedWait,
        }
        localStorage.setItem("currentQueue", JSON.stringify(updatedData))

        // Add update notification
        if (newPosition !== lastPosition) {
          if (newPosition <= 3) {
            addUpdate({
              type: "almost_ready",
              message: `You're almost up! Position #${newPosition} in line.`,
            })
          } else if (newPosition < currentPosition) {
            addUpdate({
              type: "position_change",
              message: `Your position updated to #${newPosition}. Estimated wait: ${newEstimatedWait} minutes.`,
            })
          }
          setLastPosition(newPosition)
        }

        // Trigger page refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent("queueUpdate", { detail: updatedData }))
      }

      // Simulate being called (very low chance)
      if (currentPosition === 1 && Math.random() < 0.1) {
        addUpdate({
          type: "called",
          message: "It's your turn! Please proceed to the service counter.",
        })
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [queueData, lastPosition, addUpdate])

  // Initialize notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  return {
    updates,
    requestNotificationPermission,
    clearUpdates: () => setUpdates([]),
  }
}
