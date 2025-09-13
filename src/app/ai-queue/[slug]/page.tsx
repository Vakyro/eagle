"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, MapPin, ArrowLeft, Star, Bot } from "lucide-react"
import Link from "next/link"

interface AIQueuePageProps {
  params: {
    slug: string
  }
}

interface MockRestaurant {
  name: string
  type: string
  cuisine: string
  description: string
  atmosphere: string
  priceRange: string
  features: string[]
  estimatedWait: string
  rating: number
  distance: string
}

export default function AIQueuePage({ params }: AIQueuePageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<MockRestaurant | null>(null)
  const [queueCount, setQueueCount] = useState(0)
  const [isJoined, setIsJoined] = useState(false)
  const [queuePosition, setQueuePosition] = useState(0)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(15)
  const [queueNumber, setQueueNumber] = useState<number | null>(null)
  const [maxCapacity] = useState(50) // Fixed capacity for AI restaurants

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      console.log('No user found, redirecting to login')
      router.push("/login")
      return
    }

    if (user.userType === "establishment") {
      console.log('User is establishment, redirecting to admin')
      router.push("/admin")
      return
    }

    // Create mock restaurant data from slug
    const restaurantName = params.slug.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Generate varied restaurant data based on name
    const nameHash = params.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const restaurantTypes = ["Restaurant", "Bistro", "Café", "Bar & Grill", "Fine Dining", "Casual Dining"]
    const cuisines = ["Italian", "Mexican", "American", "Asian Fusion", "Mediterranean", "French", "International"]
    const atmospheres = ["Cozy", "Upscale Casual", "Trendy", "Romantic", "Family-Friendly", "Modern", "Traditional"]
    const priceRanges = ["$", "$$", "$$$"]

    const featureOptions = [
      ["Outdoor Seating", "Wine Bar", "Reservations"],
      ["Live Music", "Happy Hour", "Private Dining"],
      ["Craft Cocktails", "Vegan Options", "Late Night"],
      ["Family-Friendly", "Pet-Friendly", "Takeout"],
      ["Rooftop", "Brunch", "WiFi"]
    ]

    const mockRestaurant: MockRestaurant = {
      name: restaurantName,
      type: restaurantTypes[nameHash % restaurantTypes.length],
      cuisine: cuisines[nameHash % cuisines.length],
      description: `Experience exceptional ${cuisines[nameHash % cuisines.length].toLowerCase()} cuisine with ${atmospheres[nameHash % atmospheres.length].toLowerCase()} ambiance. Perfect for any occasion with authentic flavors and quality service.`,
      atmosphere: atmospheres[nameHash % atmospheres.length],
      priceRange: priceRanges[nameHash % priceRanges.length],
      features: featureOptions[nameHash % featureOptions.length],
      estimatedWait: "15-25 min",
      rating: 3.8 + (nameHash % 7) * 0.1, // Rating between 3.8 and 4.4
      distance: `0.${2 + (nameHash % 8)} mi` // Distance between 0.2 and 0.9 mi
    }

    setRestaurant(mockRestaurant)

    // Generate random queue count and estimated wait time
    const randomQueueCount = Math.floor(Math.random() * 20) + 5
    setQueueCount(randomQueueCount)
    setEstimatedWaitTime(randomQueueCount * 3 + Math.floor(Math.random() * 10) + 10) // 3 min per person + random variance
  }, [user, isLoading, router, params.slug])

  const handleJoinQueue = () => {
    if (!isJoined && queueCount < maxCapacity) {
      const newPosition = queueCount + 1
      const newQueueNumber = Math.floor(Math.random() * 1000) + 100 // Random queue number like real system
      const newWaitTime = newPosition * 3 + Math.floor(Math.random() * 5) + 5

      setIsJoined(true)
      setQueuePosition(newPosition)
      setQueueNumber(newQueueNumber)
      setQueueCount(prev => prev + 1)
      setEstimatedWaitTime(newWaitTime)

      // Store in localStorage for persistence
      localStorage.setItem(`ai-queue-${params.slug}`, JSON.stringify({
        joined: true,
        position: newPosition,
        queueNumber: newQueueNumber,
        estimatedWait: newWaitTime,
        joinedAt: new Date().toISOString()
      }))

      // Show success message
      console.log(`🎉 Joined queue #${newQueueNumber} at position ${newPosition}`)
    }
  }

  const handleLeaveQueue = () => {
    setIsJoined(false)
    setQueuePosition(0)
    setQueueNumber(null)
    setQueueCount(prev => Math.max(0, prev - 1))

    // Remove from localStorage
    localStorage.removeItem(`ai-queue-${params.slug}`)
    console.log('👋 Left the queue')
  }

  // Check if user was already in queue
  useEffect(() => {
    const stored = localStorage.getItem(`ai-queue-${params.slug}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setIsJoined(data.joined)
        setQueuePosition(data.position)
        setQueueNumber(data.queueNumber)
        if (data.estimatedWait) {
          setEstimatedWaitTime(data.estimatedWait)
        }
      } catch (error) {
        console.error("Error parsing stored queue data:", error)
      }
    }
  }, [params.slug])

  // Simulate queue movement (optional enhancement)
  useEffect(() => {
    if (isJoined && queuePosition > 1) {
      const interval = setInterval(() => {
        // Sometimes move up in queue (simulate real queue movement)
        if (Math.random() < 0.3) { // 30% chance every 30 seconds
          setQueuePosition(prev => {
            const newPos = Math.max(1, prev - 1)
            const newWait = Math.max(5, estimatedWaitTime - 3)
            setEstimatedWaitTime(newWait)

            // Update localStorage
            const stored = localStorage.getItem(`ai-queue-${params.slug}`)
            if (stored) {
              const data = JSON.parse(stored)
              data.position = newPos
              data.estimatedWait = newWait
              localStorage.setItem(`ai-queue-${params.slug}`, JSON.stringify(data))
            }

            return newPos
          })
        }
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isJoined, queuePosition, estimatedWaitTime, params.slug])

  if (isLoading) {
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] text-[#050315] flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-2">Restaurant Not Found</h1>
          <Link href="/" className="text-[#2772ce] hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const getStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : i < rating
            ? 'text-yellow-400 fill-yellow-400/50'
            : 'text-gray-300'
        }`}
      />
    ))
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
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h1 className="text-lg sm:text-xl font-bold">AI Recommended</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Restaurant Info Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#050315] text-balance">{restaurant.name}</h2>
                <p className="text-gray-600 mt-1">{restaurant.cuisine} • {restaurant.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {getStars(restaurant.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{restaurant.distance}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  AI Recommended
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Open
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{restaurant.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Queue Status Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-[#050315] mb-4">Current Queue Status</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-[#050315]">{estimatedWaitTime} min</div>
                <div className="text-sm text-gray-600">estimated wait</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-[#050315]">{queueCount}</div>
                <div className="text-sm text-gray-600">people in line</div>
              </div>
            </div>

            {/* Queue Capacity Bar */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Queue Capacity</span>
                <span className="font-medium text-[#050315]">
                  {queueCount}/{maxCapacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(queueCount / maxCapacity) * 100}%` }}
                />
              </div>
              {queueCount > maxCapacity * 0.8 && (
                <p className="text-xs text-orange-600 mt-1">
                  Queue is getting full!
                </p>
              )}
            </div>

            {isJoined ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-green-800">You're in line!</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Queue Number:</span>
                      <span className="font-bold text-green-800">#{queueNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Position:</span>
                      <span className="font-bold text-green-800">#{queuePosition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Estimated Wait:</span>
                      <span className="font-bold text-green-800">{estimatedWaitTime} minutes</span>
                    </div>
                  </div>

                  {queuePosition === 1 && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                      🎉 You're next! Please be ready to be served.
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleLeaveQueue}
                  variant="outline"
                  className="w-full"
                >
                  Leave Queue
                </Button>
              </div>
            ) : (
              queueCount >= maxCapacity ? (
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-800 mb-1">Queue Full</p>
                  <p className="text-sm text-red-600">
                    This restaurant has reached maximum capacity. Please try again later.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinQueue}
                  className="w-full bg-[#2772ce] hover:bg-[#1e5ba8] text-white"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Queue
                </Button>
              )
            )}
          </div>
        </Card>

        {/* AI Notice */}
        <Card className="bg-purple-50 border border-purple-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 text-center">
            <Bot className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-purple-700">
              This restaurant was recommended by our AI system based on your preferences.
              Queue times are estimated and may vary.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}