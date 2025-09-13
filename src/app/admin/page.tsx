"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, TrendingUp, Building, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceManagementCard } from "@/components/service-management-card"
import { CreateServiceDialog } from "@/components/create-service-dialog"
import { NgrokStatusCard } from "@/components/ngrok-config"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface Establishment {
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
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      console.log('No hay usuario en admin, redirigiendo al login')
      router.push("/login")
      return
    }

    if (user.userType !== "establishment") {
      console.log('Usuario no es establishment, redirigiendo al home')
      router.push("/")
      return
    }

    console.log('Usuario establishment válido en admin:', user.businessName)

    // Load establishment from localStorage (in real app, this would be from API)
    const stored = localStorage.getItem("adminEstablishment")
    if (stored) {
      setEstablishment(JSON.parse(stored))
    } else {
      // Initialize with default establishment
      const defaultEstablishment = {
        id: "1",
        name: "Eagle Establishment",
        type: "Restaurant",
        isOpen: true,
        queueCount: 12,
        maxCapacity: 50,
        hours: "9:00 AM - 9:00 PM",
        createdAt: new Date().toISOString(),
      }
      setEstablishment(defaultEstablishment)
      localStorage.setItem("adminEstablishment", JSON.stringify(defaultEstablishment))
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    console.log('Haciendo logout desde admin')
    await logout()
    router.push("/login")
  }

  const handleUpdateEstablishment = (updatedEstablishment: Omit<Establishment, "id" | "createdAt">) => {
    if (!establishment) return
    const updated: Establishment = {
      ...updatedEstablishment,
      id: establishment.id,
      createdAt: establishment.createdAt,
    }
    setEstablishment(updated)
    localStorage.setItem("adminEstablishment", JSON.stringify(updated))
    setShowEditDialog(false)
  }

  const handleToggleEstablishment = () => {
    if (!establishment) return
    const updated = { ...establishment, isOpen: !establishment.isOpen }
    setEstablishment(updated)
    localStorage.setItem("adminEstablishment", JSON.stringify(updated))
  }

  if (isLoading) {
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

  const isEstablishmentOpen = establishment?.isOpen || false
  const totalPeopleInQueue = establishment?.queueCount || 0

  return (
    <>
      <div className="bg-eagle-blue text-white">
        <div className="content-container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Business Dashboard</h1>
                <p className="text-sm opacity-90">{user.businessName || user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowEditDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{isEstablishmentOpen ? "Open" : "Closed"}</div>
                  <div className="text-sm text-white/70">Status</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalPeopleInQueue}</div>
                  <div className="text-sm text-white/70">People Waiting</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{establishment?.maxCapacity || 0}</div>
                  <div className="text-sm text-white/70">Max Capacity</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-4 bottom-nav-spacing">
        {/* AI Configuration Card */}
        <NgrokStatusCard />

        {establishment ? (
          <Card className="service-card">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{establishment.name}</h3>
                  <p className="text-gray-600">{establishment.type}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    establishment.isOpen
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {establishment.isOpen ? "Open" : "Closed"}
                  </div>
                  <Button
                    onClick={handleToggleEstablishment}
                    variant="outline"
                    size="sm"
                  >
                    {establishment.isOpen ? "Close" : "Open"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{establishment.queueCount}</div>
                  <div className="text-sm text-gray-600">In Queue</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{establishment.maxCapacity}</div>
                  <div className="text-sm text-gray-600">Max Capacity</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-2">
                  <div className="text-lg font-medium text-gray-900">{establishment.hours}</div>
                  <div className="text-sm text-gray-600">Operating Hours</div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="service-card">
            <div className="p-8 text-center">
              <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Establishment</h3>
              <p className="text-gray-600">Please wait while we load your establishment details...</p>
            </div>
          </Card>
        )}
      </div>

      <CreateServiceDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onCreateService={handleUpdateEstablishment}
        initialData={establishment}
        mode="edit"
      />

      <BottomNav currentPage="admin" userType="admin" />
    </>
  )
}
