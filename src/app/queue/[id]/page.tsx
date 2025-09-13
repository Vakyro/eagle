"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, Users, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { JoinQueueButton } from "@/components/join-queue-button"

// Mock data - in real app this would come from API
const mockServiceDetails = {
  "1": {
    id: "1",
    name: "Bella Vista Restaurant",
    type: "Restaurant",
    description: "Authentic Italian cuisine with fresh ingredients and traditional recipes.",
    address: "123 Main Street, Downtown",
    isOpen: true,
    estimatedWait: 15,
    queueCount: 8,
    maxCapacity: 50,
    hours: "11:00 AM - 10:00 PM",
    lastUpdate: new Date().toISOString(),
  },
  "2": {
    id: "2",
    name: "Coffee Corner",
    type: "Café",
    description: "Premium coffee and fresh pastries in a cozy atmosphere.",
    address: "456 Oak Avenue, City Center",
    isOpen: true,
    estimatedWait: 5,
    queueCount: 3,
    maxCapacity: 20,
    hours: "7:00 AM - 6:00 PM",
    lastUpdate: new Date().toISOString(),
  },
  "3": {
    id: "3",
    name: "Pizza Palace",
    type: "Restaurant",
    description: "Wood-fired pizzas and Italian specialties.",
    address: "789 Pine Street, Uptown",
    isOpen: false,
    estimatedWait: 0,
    queueCount: 0,
    maxCapacity: 40,
    hours: "5:00 PM - 11:00 PM",
    lastUpdate: new Date().toISOString(),
  },
}

interface QueuePageProps {
  params: {
    id: string
  }
}

export default function QueuePage({ params }: QueuePageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const service = mockServiceDetails[params.id as keyof typeof mockServiceDetails]

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const email = localStorage.getItem("userEmail")

    if (!userType || !email) {
      router.push("/login")
      return
    }

    if (userType !== "user") {
      router.push("/admin")
      return
    }

    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] text-[#050315] flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <Link href="/" className="text-[#2772ce] hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe]">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 sm:py-6">
        <div className="content-container">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">Service Details</h1>
          </div>
        </div>
      </div>

      <div className="content-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Service Info Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#050315] text-balance">{service.name}</h2>
                <p className="text-gray-600 mt-1">{service.type}</p>
              </div>
              <div
                className={`self-start px-3 py-1 rounded-full text-sm font-medium ${
                  service.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {service.isOpen ? "Open" : "Closed"}
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{service.description}</p>

            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{service.address}</span>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Hours:</strong> {service.hours}
            </div>
          </div>
        </Card>

        {/* Queue Status Card */}
        {service.isOpen && (
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-[#050315] mb-4">Current Queue Status</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-[#050315]">{service.estimatedWait}</div>
                  <div className="text-sm text-gray-600">minutes wait</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-[#050315]">{service.queueCount}</div>
                  <div className="text-sm text-gray-600">people in line</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Queue Capacity</span>
                  <span className="font-medium text-[#050315]">
                    {service.queueCount}/{service.maxCapacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(service.queueCount / service.maxCapacity) * 100}%` }}
                  />
                </div>
              </div>

              <JoinQueueButton serviceId={service.id} serviceName={service.name} serviceType={service.type} />
            </div>
          </Card>
        )}

        {/* Closed Message */}
        {!service.isOpen && (
          <Card className="bg-red-50 border border-red-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-800">Currently Closed</h3>
              <p className="text-red-700 mb-4">This service is not accepting new queue members at the moment.</p>
              <p className="text-sm text-red-600">Hours: {service.hours}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
