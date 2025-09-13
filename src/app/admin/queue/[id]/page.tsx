"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Clock, CheckCircle, QrCode, Camera } from "lucide-react"
import Link from "next/link"
import { AdminQueueTable } from "@/components/admin-queue-table"
import { QRScanner } from "@/components/qr-scanner"
import { useState, useEffect } from "react"

interface QueueMember {
  id: string
  name: string
  joinedAt: string
  position: number
  qrCode: string
  status: "waiting" | "called" | "served"
}

interface Service {
  id: string
  name: string
  type: string
  isOpen: boolean
  queueCount: number
  maxCapacity: number
}

interface AdminQueuePageProps {
  params: {
    id: string
  }
}

export default function AdminQueuePage({ params }: AdminQueuePageProps) {
  const [service, setService] = useState<Service | null>(null)
  const [queueMembers, setQueueMembers] = useState<QueueMember[]>([])
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    // Load service data
    const services = JSON.parse(localStorage.getItem("adminServices") || "[]")
    const currentService = services.find((s: Service) => s.id === params.id)
    setService(currentService)

    // Generate mock queue members
    if (currentService && currentService.queueCount > 0) {
      const mockMembers: QueueMember[] = Array.from({ length: currentService.queueCount }, (_, i) => ({
        id: `member-${i + 1}`,
        name: `Customer ${i + 1}`,
        joinedAt: new Date(Date.now() - (currentService.queueCount - i) * 5 * 60000).toISOString(),
        position: i + 1,
        qrCode: `queue-${params.id}-${Date.now() - i * 1000}`,
        status: "waiting" as const,
      }))
      setQueueMembers(mockMembers)
    }
  }, [params.id])

  const handleCallNext = () => {
    if (queueMembers.length > 0) {
      const updatedMembers = queueMembers.map((member, index) =>
        index === 0 ? { ...member, status: "called" as const } : member,
      )
      setQueueMembers(updatedMembers)
    }
  }

  const handleServeCustomer = (memberId: string) => {
    const updatedMembers = queueMembers
      .map((member) => (member.id === memberId ? { ...member, status: "served" as const } : member))
      .filter((member) => member.status !== "served")
      .map((member, index) => ({ ...member, position: index + 1 }))

    setQueueMembers(updatedMembers)

    // Update service queue count
    if (service) {
      const updatedService = { ...service, queueCount: updatedMembers.length }
      setService(updatedService)

      // Update localStorage
      const services = JSON.parse(localStorage.getItem("adminServices") || "[]")
      const updatedServices = services.map((s: Service) => (s.id === params.id ? updatedService : s))
      localStorage.setItem("adminServices", JSON.stringify(updatedServices))
    }
  }

  const handleRemoveCustomer = (memberId: string) => {
    const updatedMembers = queueMembers
      .filter((member) => member.id !== memberId)
      .map((member, index) => ({ ...member, position: index + 1 }))

    setQueueMembers(updatedMembers)

    // Update service queue count
    if (service) {
      const updatedService = { ...service, queueCount: updatedMembers.length }
      setService(updatedService)

      // Update localStorage
      const services = JSON.parse(localStorage.getItem("adminServices") || "[]")
      const updatedServices = services.map((s: Service) => (s.id === params.id ? updatedService : s))
      localStorage.setItem("adminServices", JSON.stringify(updatedServices))
    }
  }

  const handleQRScan = (qrCode: string) => {
    // Find member by QR code
    const member = queueMembers.find((m) => m.qrCode === qrCode)
    if (member) {
      // Automatically serve the customer
      handleServeCustomer(member.id)
      setShowScanner(false)
    } else {
      alert("QR code not found in current queue")
    }
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#050315] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <Link href="/admin" className="text-[#2772ce] hover:underline">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const waitingMembers = queueMembers.filter((m) => m.status === "waiting")
  const calledMembers = queueMembers.filter((m) => m.status === "called")

  return (
    <div className="min-h-screen bg-[#050315] text-white">
      <div className="bg-[#fbfbfe] text-[#050315] px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin" className="p-2 -ml-2 rounded-lg hover:bg-[#050315]/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{service.name}</h1>
            <p className="text-sm text-[#050315]/70">Queue Management</p>
          </div>
          <Button
            onClick={() => setShowScanner(true)}
            variant="outline"
            size="sm"
            className="border-[#2772ce] text-[#2772ce] hover:bg-[#2772ce] hover:text-white"
          >
            <Camera className="w-4 h-4 mr-1" />
            Scan QR
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[#2772ce]/10 border-none p-3">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-[#2772ce]" />
              <div className="text-lg font-bold text-[#050315]">{waitingMembers.length}</div>
              <div className="text-xs text-[#050315]/70">Waiting</div>
            </div>
          </Card>

          <Card className="bg-[#ddc248]/20 border-none p-3">
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-[#050315]" />
              <div className="text-lg font-bold text-[#050315]">{calledMembers.length}</div>
              <div className="text-xs text-[#050315]/70">Called</div>
            </div>
          </Card>

          <Card className="bg-[#050315]/10 border-none p-3">
            <div className="text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-[#050315]" />
              <div className="text-lg font-bold text-[#050315]">{service.maxCapacity}</div>
              <div className="text-xs text-[#050315]/70">Capacity</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {waitingMembers.length > 0 && (
          <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#050315]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#050315]">Next Customer</h3>
                <Button onClick={handleCallNext} className="bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
                  Call Next
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#050315]">{waitingMembers[0]?.name}</div>
                  <div className="text-sm text-[#050315]/70">
                    Position #{waitingMembers[0]?.position} • Joined{" "}
                    {new Date(waitingMembers[0]?.joinedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <QrCode className="w-8 h-8 text-[#2772ce]" />
              </div>
            </div>
          </Card>
        )}

        <AdminQueueTable
          queueMembers={queueMembers}
          onServeCustomer={handleServeCustomer}
          onRemoveCustomer={handleRemoveCustomer}
        />

        {queueMembers.length === 0 && (
          <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
            <div className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#050315]/30" />
              <h3 className="text-xl font-semibold text-[#050315] mb-2">No Queue Members</h3>
              <p className="text-[#050315]/70 leading-relaxed">
                The queue is currently empty. Customers will appear here when they join.
              </p>
            </div>
          </Card>
        )}
      </div>

      <QRScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={handleQRScan} />
    </div>
  )
}
