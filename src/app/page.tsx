"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ServiceCard } from "@/components/service-card"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/contexts/AuthContext"
import { serviceService } from "@/lib/database"
import { estimateWaitTime } from "@/lib/queue-management"
import type { Service } from "@/lib/supabase"
import { Search, MapPin, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServiceWithStats extends Service {
  queueCount: number
  estimatedWait: number
  lastUpdate: string
}

export default function HomePage() {
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user, isLoading, logout: authLogout } = useAuth()
  const router = useRouter()

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
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const allServices = await serviceService.getAll({ is_open: true })

      // Add queue stats to each service
      const servicesWithStats = await Promise.all(
        allServices.map(async (service) => {
          try {
            const estimatedWait = await estimateWaitTime(service.id)
            // For now, we'll use a simple queue count calculation
            // In a real implementation, you'd get this from the queue entries
            const queueCount = Math.floor(estimatedWait / 15) || 0

            return {
              ...service,
              queueCount,
              estimatedWait,
              lastUpdate: new Date().toISOString()
            }
          } catch (error) {
            console.error(`Error getting stats for service ${service.id}:`, error)
            return {
              ...service,
              queueCount: 0,
              estimatedWait: 0,
              lastUpdate: new Date().toISOString()
            }
          }
        })
      )

      setServices(servicesWithStats)
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authLogout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.establishment?.business_name &&
     service.establishment.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2772ce] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <>
      <div className="bg-[#2772ce] text-white">
        <div className="content-container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Welcome back</p>
                <p className="font-semibold">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Find services</p>
              <p className="font-semibold">Near you</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cafes, services..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 border-0 focus:ring-2 focus:ring-[#ddc248]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="content-container py-6 bottom-nav-spacing">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Available Services</h2>
          <span className="text-sm text-gray-600">{filteredServices.length} places</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No services found" : "No services available"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? `Try searching for something else`
                : "Check back later for available services"}
            </p>
          </div>
        ) : (
          <div className="mobile-grid">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={{
                  id: service.id,
                  name: service.name,
                  type: service.service_type,
                  isOpen: service.is_open,
                  estimatedWait: service.estimatedWait,
                  queueCount: service.queueCount,
                  lastUpdate: service.lastUpdate
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPage="home" userType="user" />
    </>
  )
}
