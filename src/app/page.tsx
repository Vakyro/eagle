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
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [recommendations, setRecommendations] = useState<RecommendedRestaurant[]>([])
  const { user, isLoading, logout: authLogout } = useAuth()
  const router = useRouter()

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
          picture: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
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
          picture: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop",
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
          is_active: true,
          password_hash: "demo"
        }
      ]

      let createdCount = 0
      for (const establishment of sampleEstablishments) {
        try {
          await establishmentService.create(establishment)
          createdCount++
          console.log(`✅ Created: ${establishment.business_name}`)
        } catch (error) {
          console.warn(`⚠️ Skipped (might exist): ${establishment.business_name}`, error)
        }
      }

      console.log(`✅ Sample establishments creation completed. Created: ${createdCount}`)
      return createdCount > 0
    } catch (error) {
      console.error("❌ Error creating sample establishments:", error)
      throw error
    }
  }

  const loadEstablishments = async () => {
    try {
      console.log("🔍 Starting to load establishments...")
      setError(null)

      // Step 1: Try to get existing establishments
      console.log("📡 Fetching establishments from database...")
      let allEstablishments = await establishmentService.getAll()
      
      console.log("📊 Raw database result:")
      console.log("  - Type:", typeof allEstablishments)
      console.log("  - Is Array:", Array.isArray(allEstablishments))
      console.log("  - Length:", allEstablishments?.length || 0)
      console.log("  - Data:", allEstablishments)

      // Step 2: Handle empty results
      if (!allEstablishments || allEstablishments.length === 0) {
        console.warn("⚠️ No establishments found in database")
        console.log("🏗️ Attempting to create sample data...")
        
        const created = await createSampleEstablishments()
        
        if (created) {
          // Wait a moment for database to process
          console.log("⏳ Waiting for database to process...")
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Retry loading
          console.log("🔄 Retrying to fetch establishments...")
          allEstablishments = await establishmentService.getAll()
          console.log("📊 After retry - Length:", allEstablishments?.length || 0)
        }
        
        if (!allEstablishments || allEstablishments.length === 0) {
          console.error("❌ Still no establishments after creating samples")
          setEstablishments([])
          setError("No establishments found. Please check your database connection.")
          return
        }
      }

      console.log(`✅ Found ${allEstablishments.length} establishments`)

      // Step 3: Add queue stats to each establishment
      console.log("📊 Adding queue statistics...")
      const establishmentsWithStats = await Promise.all(
        allEstablishments.map(async (establishment, index) => {
          try {
            console.log(`  Processing ${index + 1}/${allEstablishments.length}: ${establishment.business_name}`)
            
            // Add timeout to estimateWaitTime to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
            
            const estimatedWait = await Promise.race([
              estimateWaitTime(establishment.id),
              timeoutPromise
            ]) as number
            
            const queueCount = Math.floor(estimatedWait / 15) || 0

            return {
              ...establishment,
              queueCount,
              estimatedWait,
              lastUpdate: new Date().toISOString()
            }
          } catch (error) {
            console.warn(`⚠️ Error getting stats for ${establishment.business_name}:`, error)
            // Return with default values if stats fail
            return {
              ...establishment,
              queueCount: Math.floor(Math.random() * 5), // Random for demo
              estimatedWait: Math.floor(Math.random() * 30) + 10, // Random 10-40 min
              lastUpdate: new Date().toISOString()
            }
          }
        })
      )

      console.log(`✅ Successfully processed ${establishmentsWithStats.length} establishments`)
      console.log('🔍 First establishment data:', establishmentsWithStats[0])
      setEstablishments(establishmentsWithStats)
      
    } catch (error) {
      console.error("❌ Critical error loading establishments:", error)
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      setEstablishments([])
      setError(`Failed to load establishments: ${error.message}`)
    }
  }

  // SINGLE useEffect to handle everything in proper order
  useEffect(() => {
    const initializePage = async () => {
      console.log("🚀 Initializing HomePage...")
      console.log("  - isLoading:", isLoading)
      console.log("  - user:", user ? "present" : "null")
      console.log("  - userType:", user?.userType)

      // Wait for auth to finish loading
      if (isLoading) {
        console.log("⏳ Waiting for authentication...")
        return
      }

      // Check authentication
      if (!user) {
        console.log("🚫 No user found, redirecting to login...")
        router.push("/login")
        return
      }

      // Check user type
      if (user.userType === "establishment") {
        console.log("🏢 Establishment user, redirecting to admin...")
        router.push("/admin")
        return
      }

      console.log("✅ User authenticated, loading establishments...")
      
      // Only load establishments if user is properly authenticated
      setLoading(true)
      await loadEstablishments()
      setLoading(false)
    }

    initializePage()
  }, [user, isLoading, router])

  const testSupabaseConnection = async () => {
    console.log("🧪 MANUAL TEST: Testing Supabase connection...")
    
    try {
      // Test 1: Verificar variables de entorno
      console.log("📋 Environment variables check:")
      console.log("  - URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
      console.log("  - ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
      
      // Test 2: Query a través del service
      console.log("📋 Service query test:")
      const serviceResult = await establishmentService.getAll()
      console.log("  - Service result:", serviceResult)
      console.log("  - Service result type:", typeof serviceResult)
      console.log("  - Service result length:", serviceResult?.length || 0)
      
      return serviceResult
      
    } catch (error) {
      console.error("❌ Manual test error:", error)
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return null
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

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2772ce] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? "Authenticating..." : "Loading establishments..."}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#2772ce]">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Redirect cases (will return null while redirecting)
  if (!user) {
    return null
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RestaurantFiltersModal onRecommendations={setRecommendations} />
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-6 bottom-nav-spacing space-y-8">
        <RecommendedRestaurants
          restaurants={recommendations}
          onClear={() => setRecommendations([])}
        />

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
              {!searchTerm && (
                <Button 
                  onClick={() => {
                    setLoading(true)
                    loadEstablishments().finally(() => setLoading(false))
                  }} 
                  className="mt-4 bg-[#2772ce]"
                >
                  Refresh
                </Button>
              )}
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