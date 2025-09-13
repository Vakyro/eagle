"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface SimpleJoinButtonProps {
  establishmentId: string
  establishmentName: string
  establishmentType: string
}

export function SimpleJoinButton({
  establishmentId,
  establishmentName,
  establishmentType
}: SimpleJoinButtonProps) {
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleJoinQueue = async () => {
    console.log('🔄 Join Queue clicked!', { establishmentId, establishmentName, establishmentType })

    try {
      setIsJoining(true)

      // Simple simulation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const queueData = {
        establishmentId,
        establishmentName,
        establishmentType,
        joinedAt: new Date().toISOString(),
        position: Math.floor(Math.random() * 5) + 1,
        estimatedWait: Math.floor(Math.random() * 20) + 5,
        qrCode: `simple-queue-${establishmentId}-${Date.now()}`,
      }

      console.log('✅ Queue data created:', queueData)

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("establishmentQueues") || "[]")
      const updated = [...existing, queueData]
      localStorage.setItem("establishmentQueues", JSON.stringify(updated))

      console.log('✅ Saved to localStorage, redirecting...')

      // Navigate
      router.push("/my-queue")

    } catch (error) {
      console.error('❌ Error joining queue:', error)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Button
      onClick={handleJoinQueue}
      disabled={isJoining}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
    >
      {isJoining ? "Joining..." : "🚀 Simple Join Queue"}
    </Button>
  )
}