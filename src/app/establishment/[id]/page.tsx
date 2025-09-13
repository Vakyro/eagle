"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, MapPin, ArrowLeft, Star, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { JoinQueueButton } from "@/components/join-queue-button"
import { establishmentService } from "@/lib/database"
import { estimateWaitTime, getQueueStats } from "@/lib/queue-management"
import type { Establishment } from "@/lib/supabase"

interface EstablishmentWithStats extends Establishment {
  queueCount: number
  estimatedWait: number
  lastUpdate: string
}

interface EstablishmentPageProps {
  params: {
    id: string
  }
}

export default function EstablishmentPage({ params }: EstablishmentPageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<EstablishmentWithStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      console.log('No hay usuario en establishment page, redirigiendo al login')
      router.push("/login")
      return
    }

    if (user.userType === "establishment") {
      console.log('Usuario es establishment, redirigiendo al admin')
      router.push("/admin")
      return
    }

    console.log('Usuario válido en establishment page:', user.email)
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user || isLoading) return
    loadEstablishment()
  }, [user, isLoading, params.id])

  const loadEstablishment = async () => {
    try {
      setLoading(true)

      // Get establishment details
      const establishmentData = await establishmentService.getById(params.id)

      if (!establishmentData) {
        setEstablishment(null)
        return
      }

      // Get queue statistics (using establishment ID)
      const stats = await getQueueStats(params.id)
      const estimatedWait = await estimateWaitTime(params.id)

      const establishmentWithStats: EstablishmentWithStats = {
        ...establishmentData,
        queueCount: stats.totalWaiting + stats.totalCalled,
        estimatedWait,
        lastUpdate: new Date().toISOString()
      }

      setEstablishment(establishmentWithStats)
    } catch (error) {
      console.error('Error loading establishment:', error)
      setEstablishment(null)
    } finally {
      setLoading(false)
    }
  }

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
    return null // Se redirigirá al login
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] text-[#050315] flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-2">Establishment Not Found</h1>
          <Link href="/" className="text-[#2772ce] hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const imageUrl = establishment.pictures ||
    `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center`

  return (
    <div className="min-h-screen bg-[#fbfbfe]">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 sm:py-6">
        <div className="content-container">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">Establishment Details</h1>
          </div>
        </div>
      </div>

      <div className="content-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Establishment Info Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-48 sm:h-64 bg-gray-200">
            <Image
              src={imageUrl}
              alt={establishment.business_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                establishment.is_active
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {establishment.is_active ? "Open" : "Closed"}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#050315] mb-2">
                  {establishment.business_name}
                </h2>
                <p className="text-gray-600 capitalize text-lg mb-2">
                  {establishment.business_type}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-600 ml-1">4.2 (127 reviews)</span>
                </div>
              </div>
            </div>

            {establishment.description && (
              <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
                {establishment.description}
              </p>
            )}

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{establishment.address}</span>
              </div>
              {establishment.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{establishment.phone}</span>
                </div>
              )}
              {establishment.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{establishment.email}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Queue Status Card */}
        {establishment.is_active && (
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-[#050315] mb-4">Current Queue Status</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-[#050315]">{establishment.estimatedWait}</div>
                  <div className="text-sm text-gray-600">minutes wait</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-[#050315]">{establishment.queueCount}</div>
                  <div className="text-sm text-gray-600">people in line</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Queue Capacity</span>
                  <span className="font-medium text-[#050315]">
                    {establishment.queueCount}/50
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(establishment.queueCount / 50) * 100}%` }}
                  />
                </div>
              </div>

              <JoinQueueButton
                serviceId={establishment.id}
                serviceName={establishment.business_name}
                serviceType={establishment.business_type}
              />
            </div>
          </Card>
        )}

        {/* Closed Message */}
        {!establishment.is_active && (
          <Card className="bg-red-50 border border-red-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-800">Currently Closed</h3>
              <p className="text-red-700 mb-4">This establishment is not accepting new queue members at the moment.</p>
              <p className="text-sm text-red-600">Please check back later when they're open.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}