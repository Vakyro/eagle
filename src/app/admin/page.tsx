"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, TrendingUp, Building, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceManagementCard } from "@/components/service-management-card"
import { CreateServiceDialog } from "@/components/create-service-dialog"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  name: string
  type: string
  isOpen: boolean
  queueCount: number
  maxCapacity: number
  hours: string
  createdAt: string
}

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const email = localStorage.getItem("userEmail")

    if (!userType || !email) {
      router.push("/login")
      return
    }

    if (userType !== "admin") {
      router.push("/")
      return
    }

    setAdminEmail(email)
    setIsAuthenticated(true)

    // Load services from localStorage (in real app, this would be from API)
    const stored = localStorage.getItem("adminServices")
    if (stored) {
      setServices(JSON.parse(stored))
    } else {
      // Initialize with mock data
      const mockServices = [
        {
          id: "1",
          name: "Bella Vista Restaurant",
          type: "Restaurant",
          isOpen: true,
          queueCount: 8,
          maxCapacity: 50,
          hours: "11:00 AM - 10:00 PM",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Coffee Corner",
          type: "Café",
          isOpen: true,
          queueCount: 3,
          maxCapacity: 20,
          hours: "7:00 AM - 6:00 PM",
          createdAt: new Date().toISOString(),
        },
      ]
      setServices(mockServices)
      localStorage.setItem("adminServices", JSON.stringify(mockServices))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  const handleCreateService = (newService: Omit<Service, "id" | "createdAt">) => {
    const service: Service = {
      ...newService,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const updatedServices = [...services, service]
    setServices(updatedServices)
    localStorage.setItem("adminServices", JSON.stringify(updatedServices))
    setShowCreateDialog(false)
  }

  const handleToggleService = (serviceId: string) => {
    const updatedServices = services.map((service) =>
      service.id === serviceId ? { ...service, isOpen: !service.isOpen } : service,
    )
    setServices(updatedServices)
    localStorage.setItem("adminServices", JSON.stringify(updatedServices))
  }

  const handleDeleteService = (serviceId: string) => {
    const updatedServices = services.filter((service) => service.id !== serviceId)
    setServices(updatedServices)
    localStorage.setItem("adminServices", JSON.stringify(updatedServices))
  }

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

  const totalActiveQueues = services.filter((s) => s.isOpen).length
  const totalPeopleInQueues = services.reduce((sum, s) => sum + s.queueCount, 0)

  return (
    <>
      <div className="bg-blue-600 text-white">
        <div className="content-container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Business Dashboard</h1>
                <p className="text-sm opacity-90">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalActiveQueues}</div>
                  <div className="text-sm text-white/70">Active Queues</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalPeopleInQueues}</div>
                  <div className="text-sm text-white/70">Total Waiting</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{services.length}</div>
                  <div className="text-sm text-white/70">Total Services</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-4">
        {services.length === 0 ? (
          <Card className="service-card">
            <div className="p-8 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create your first service to start managing queues and serving customers.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </div>
          </Card>
        ) : (
          <div className="mobile-grid">
            {services.map((service) => (
              <ServiceManagementCard
                key={service.id}
                service={service}
                onToggle={handleToggleService}
                onDelete={handleDeleteService}
              />
            ))}
          </div>
        )}
      </div>

      <CreateServiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateService={handleCreateService}
      />

      <BottomNav currentPage="admin" userType="admin" />
    </>
  )
}
