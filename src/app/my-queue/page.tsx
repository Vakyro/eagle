"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, ArrowLeft, Users, Trash2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { QueueStatus } from "@/components/queue-status"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { NotificationBanner } from "@/components/notification-banner"
import { useQueueUpdates } from "@/hooks/use-queue-updates"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface QueueData {
  serviceId: string
  serviceName: string
  serviceType: string
  joinedAt: string
  position: number
  estimatedWait: number
  qrCode: string
}

export default function MyQueuePage() {
  const [allQueues, setAllQueues] = useState<QueueData[]>([])
  const [activeQueue, setActiveQueue] = useState<QueueData | null>(null)
  const [isQueueLoading, setIsQueueLoading] = useState(true)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const { updates, requestNotificationPermission, clearUpdates } = useQueueUpdates(activeQueue)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.userType === "establishment") {
      router.push("/admin")
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return

    const loadQueueData = () => {
      // Check for new establishment queues first
      const storedEstablishmentQueues = localStorage.getItem("establishmentQueues")
      if (storedEstablishmentQueues) {
        const queues = JSON.parse(storedEstablishmentQueues)
        // Convert establishment queues to compatible format
        const compatibleQueues = queues.map((q: any) => ({
          serviceId: q.establishmentId,
          serviceName: q.establishmentName,
          serviceType: q.establishmentType,
          joinedAt: q.joinedAt,
          position: q.position,
          estimatedWait: q.estimatedWait,
          qrCode: q.qrCode
        }))
        setAllQueues(compatibleQueues)
        if (compatibleQueues.length > 0) {
          setActiveQueue(compatibleQueues[compatibleQueues.length - 1])
        }
      } else {
        // Check legacy userQueues
        const storedQueues = localStorage.getItem("userQueues")
        if (storedQueues) {
          const queues = JSON.parse(storedQueues)
          setAllQueues(queues)
          if (queues.length > 0) {
            setActiveQueue(queues[queues.length - 1])
          }
        } else {
          // Backward compatibility - check for single queue
          const storedSingle = localStorage.getItem("currentQueue")
          if (storedSingle) {
            const singleQueue = JSON.parse(storedSingle)
            setAllQueues([singleQueue])
            setActiveQueue(singleQueue)
          }
        }
      }
      setIsQueueLoading(false)
    }

    loadQueueData()

    const handleQueueUpdate = (event: CustomEvent) => {
      setActiveQueue(event.detail)
    }

    window.addEventListener("queueUpdate", handleQueueUpdate as EventListener)

    return () => {
      window.removeEventListener("queueUpdate", handleQueueUpdate as EventListener)
    }
  }, [user])

  const handleLeaveQueue = (queueToRemove: QueueData) => {
    const updatedQueues = allQueues.filter((q) => q.serviceId !== queueToRemove.serviceId)
    setAllQueues(updatedQueues)

    // Update both storage formats
    localStorage.setItem("userQueues", JSON.stringify(updatedQueues))

    // Also update establishmentQueues if it exists
    const storedEstablishmentQueues = localStorage.getItem("establishmentQueues")
    if (storedEstablishmentQueues) {
      const establishmentQueues = JSON.parse(storedEstablishmentQueues)
      const updatedEstablishmentQueues = establishmentQueues.filter((q: any) => q.establishmentId !== queueToRemove.serviceId)
      localStorage.setItem("establishmentQueues", JSON.stringify(updatedEstablishmentQueues))
    }

    // Update active queue
    if (activeQueue?.serviceId === queueToRemove.serviceId) {
      const newActive = updatedQueues.length > 0 ? updatedQueues[updatedQueues.length - 1] : null
      setActiveQueue(newActive)
      if (newActive) {
        localStorage.setItem("currentQueue", JSON.stringify(newActive))
      } else {
        localStorage.removeItem("currentQueue")
      }
    }

    clearUpdates()
  }

  const handleSetActiveQueue = (queue: QueueData) => {
    setActiveQueue(queue)
    localStorage.setItem("currentQueue", JSON.stringify(queue))
  }

  const handleRefresh = () => {
    if (activeQueue) {
      // Simulate position update
      const updatedData = {
        ...activeQueue,
        position: Math.max(1, activeQueue.position - Math.floor(Math.random() * 2)),
        estimatedWait: Math.max(2, activeQueue.estimatedWait - Math.floor(Math.random() * 5)),
      }
      setActiveQueue(updatedData)

      // Update in all queues array
      const updatedQueues = allQueues.map((q) => (q.serviceId === activeQueue.serviceId ? updatedData : q))
      setAllQueues(updatedQueues)
      localStorage.setItem("userQueues", JSON.stringify(updatedQueues))
      localStorage.setItem("currentQueue", JSON.stringify(updatedData))
    }
  }

  if (isLoading || isQueueLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2772ce] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Se redirigirá al login
  }

  return (
    <>
      <div className="bg-blue-600 text-white">
        <div className="content-container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">My Queues</h1>
              <p className="text-sm opacity-90">
                {allQueues.length > 0
                  ? `${allQueues.length} active queue${allQueues.length > 1 ? "s" : ""}`
                  : "No active queues"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-6 bottom-nav-spacing">
        {allQueues.length > 0 ? (
          <>
            {allQueues.length > 1 && (
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Your Queues
                  </h3>
                  <div className="space-y-2">
                    {allQueues.map((queue) => (
                      <div
                        key={queue.serviceId}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          activeQueue?.serviceId === queue.serviceId
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex-1 cursor-pointer" onClick={() => handleSetActiveQueue(queue)}>
                          <div className="font-medium text-gray-900">{queue.serviceName}</div>
                          <div className="text-sm text-gray-600">
                            Position {queue.position} • {queue.estimatedWait} min wait
                          </div>
                        </div>
                        <Button
                          onClick={() => handleLeaveQueue(queue)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {activeQueue && (
              <>
                <NotificationBanner
                  updates={updates}
                  onClearUpdates={clearUpdates}
                  onRequestPermission={requestNotificationPermission}
                />

                <QueueStatus queueData={activeQueue} onRefresh={handleRefresh} />

                <QRCodeDisplay
                  value={activeQueue.qrCode}
                  title="Your Queue QR Code"
                  subtitle="Show this code when called by staff"
                  size={180}
                />

                {allQueues.length === 1 && (
                  <Button
                    onClick={() => handleLeaveQueue(activeQueue)}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                  >
                    Leave Queue
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          <Card className="service-card">
            <div className="p-8 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Queues</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You're not currently in any queue. Discover nearby services and join a queue to get started.
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Discover Services</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      <BottomNav currentPage="queue" userType="user" />
    </>
  )
}
