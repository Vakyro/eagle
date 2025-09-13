"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EstablishmentCard } from "@/components/establishment-card"
import { BottomNav } from "@/components/bottom-nav"
import { RestaurantFiltersModal } from "@/components/restaurant-filters"
import { RecommendedRestaurants } from "@/components/recommended-restaurants"
import { useAuth } from "@/contexts/AuthContext"
import { establishmentService } from "@/lib/database"
import { estimateWaitTime } from "@/lib/queue-management"
import type { Establishment } from "@/lib/supabase"
import type { RecommendedRestaurant } from "@/lib/restaurant-recommendations"
import { Search, MapPin, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EstablishmentWithStats extends Establishment {
  queueCount: number
  estimatedWait: number
  lastUpdate: string
}

export default function HomePage() {
  const [establishments, setEstablishments] = useState<EstablishmentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [recommendations, setRecommendations] = useState<RecommendedRestaurant[]>([])
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

  const createSampleEstablishments = async () => {
    try {
      console.log("🏗️ Creating sample establishments...")

      const sampleEstablishments = [
        {
          business_name: "The Golden Spoon",
          business_type: "restaurant",
          owner_name: "Demo Owner",
          email: "golden@demo.com",
          phone: "(555) 123-4567",
          address: "123 Main St, Downtown",
          description: "A contemporary dining experience with globally inspired dishes and elegant ambiance.",
          pictures: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
          is_active: true,
          password_hash: "demo"
        },
        {
          business_name: "Sunset Café",
          business_type: "café",
          owner_name: "Demo Owner",
          email: "sunset@demo.com",
          phone: "(555) 234-5678",
          address: "456 Oak Ave, Midtown",
          description: "Cozy café with artisan coffee, fresh pastries, and a warm atmosphere perfect for work or relaxation.",
          pictures: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop",
          is_active: true,
          password_hash: "demo"
        },
        {
          business_name: "Pizza Palace",
          business_type: "restaurant",
          owner_name: "Demo Owner",
          email: "pizza@demo.com",
          phone: "(555) 345-6789",
          address: "789 Pine St, Uptown",
          description: "Authentic wood-fired pizza with fresh ingredients and traditional recipes from Italy.",
          pictures: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
          is_active: true,
          password_hash: "demo"
        },
        {
          business_name: "Brew & Bites",
          business_type: "bar",
          owner_name: "Demo Owner",
          email: "brew@demo.com",
          phone: "(555) 456-7890",
          address: "321 Elm St, Old Town",
          description: "Craft brewery and gastropub featuring local beers, artisan cocktails, and elevated pub food.",
          pictures: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=400&fit=crop",
          is_active: true,
          password_hash: "demo"
        },
        {
          business_name: "Sushi Zen",
          business_type: "restaurant",
          owner_name: "Demo Owner",
          email: "sushi@demo.com",
          phone: "(555) 567-8901",
          address: "654 Bamboo Lane, Eastside",
          description: "Traditional Japanese sushi bar with fresh fish, authentic preparation, and serene atmosphere.",
          pictures: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop",
          is_active: true,
          password_hash: "demo"
        }
      ]

      for (const establishment of sampleEstablishments) {
        try {
          await establishmentService.create(establishment)
        } catch (error) {
          console.warn("Sample establishment might already exist:", establishment.business_name)
        }
      }

      console.log("✅ Sample establishments creation completed")
    } catch (error) {
      console.error("❌ Error creating sample establishments:", error)
    }
  }

  useEffect(() => {
    loadEstablishments()
  }, [])

  const loadEstablishments = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading establishments...")

      let allEstablishments = await establishmentService.getAll()
      console.log("📊 Establishments found:", allEstablishments?.length || 0, allEstablishments)

      if (!allEstablishments || allEstablishments.length === 0) {
        console.warn("⚠️ No establishments found in database")
        // Try to create some sample establishments for demo
        await createSampleEstablishments()
        // Retry loading after creating samples
        allEstablishments = await establishmentService.getAll()
        if (!allEstablishments || allEstablishments.length === 0) {
          setEstablishments([])
          return
        }
        console.log("📊 Sample establishments created:", allEstablishments.length)
      }

      // Add queue stats to each establishment
      const establishmentsWithStats = await Promise.all(
        allEstablishments.map(async (establishment) => {
          try {
            // Use establishment ID for queue estimation
            const estimatedWait = await estimateWaitTime(establishment.id)
            // For now, we'll use a simple queue count calculation
            const queueCount = Math.floor(estimatedWait / 15) || 0

            return {
              ...establishment,
              queueCount,
              estimatedWait,
              lastUpdate: new Date().toISOString()
            }
          } catch (error) {
            console.error(`Error getting stats for establishment ${establishment.id}:`, error)
            return {
              ...establishment,
              queueCount: 0,
              estimatedWait: 0,
              lastUpdate: new Date().toISOString()
            }
          }
        })
      )

      console.log("✅ Establishments with stats:", establishmentsWithStats.length)
      setEstablishments(establishmentsWithStats)
    } catch (error) {
      console.error("❌ Error loading establishments:", error)
      setEstablishments([])
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

  // Filter establishments based on search term
  const filteredEstablishments = establishments.filter(establishment =>
    establishment.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    establishment.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (establishment.address && establishment.address.toLowerCase().includes(searchTerm.toLowerCase()))
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
              placeholder="Search restaurants, cafes, businesses..."
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white text-gray-900 border-0 focus:ring-2 focus:ring-[#ddc248]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* AI Recommendations Filter Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RestaurantFiltersModal onRecommendations={setRecommendations} />
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-6 bottom-nav-spacing space-y-8">
        {/* AI Recommendations Section */}
        <RecommendedRestaurants
          restaurants={recommendations}
          onClear={() => setRecommendations([])}
        />

        {/* Regular Services Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {recommendations.length > 0 ? "All Establishments" : "Available Establishments"}
            </h2>
            <span className="text-sm text-gray-600">{filteredEstablishments.length} places</span>
          </div>

          {filteredEstablishments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No establishments found" : "No establishments available"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `Try searching for something else`
                  : "Check back later for available establishments"}
              </p>
            </div>
          ) : (
            <div className="mobile-grid">
              {filteredEstablishments.map((establishment) => (
                <EstablishmentCard
                  key={establishment.id}
                  establishment={establishment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav currentPage="home" userType="user" />
    </>
  )
}
