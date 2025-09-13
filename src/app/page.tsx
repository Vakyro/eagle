"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ServiceCard } from "@/components/service-card"
import { BottomNav } from "@/components/bottom-nav"
import { Search, MapPin, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for services
const mockServices = [
  {
    id: "1",
    name: "Bella Vista Restaurant",
    type: "Restaurant",
    isOpen: true,
    estimatedWait: 15,
    queueCount: 8,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Coffee Corner",
    type: "Café",
    isOpen: true,
    estimatedWait: 5,
    queueCount: 3,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Pizza Palace",
    type: "Restaurant",
    isOpen: false,
    estimatedWait: 0,
    queueCount: 0,
    lastUpdate: new Date().toISOString(),
  },
]

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const email = localStorage.getItem("userEmail")

    if (!userType || !email) {
      router.push("/login")
      return
    }

    if (userType === "admin") {
      router.push("/admin")
      return
    }

    setUserEmail(email)
    setIsAuthenticated(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eagle-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-eagle-blue text-white">
        <div className="content-container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Welcome back</p>
                <p className="font-semibold">{userEmail}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Deliver to</p>
              <p className="font-semibold">Current Location</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cafes..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 border-0 focus:ring-2 focus:ring-eagle-gold"
            />
          </div>
        </div>
      </div>

      <div className="content-container py-6 bottom-nav-spacing">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nearby Services</h2>
          <span className="text-sm text-gray-600">{mockServices.length} places</span>
        </div>

        <div className="mobile-grid">
          {mockServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <BottomNav currentPage="home" userType="user" />
    </>
  )
}
