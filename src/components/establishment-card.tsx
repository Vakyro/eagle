"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, Users, MapPin, Star } from "lucide-react"
import type { Establishment } from "@/lib/supabase"

interface EstablishmentWithStats extends Establishment {
  queueCount: number
  estimatedWait: number
  lastUpdate: string
}

interface EstablishmentCardProps {
  establishment: EstablishmentWithStats
}

export function EstablishmentCard({ establishment }: EstablishmentCardProps) {
  // Debug log
  console.log('🏢 EstablishmentCard data:', {
    id: establishment.id,
    name: establishment.business_name,
    type: typeof establishment.id
  })

  // Generate a fallback image URL if no picture is provided
  const imageUrl = establishment.picture ||
    `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center`

  const formatEstimatedWait = (minutes: number) => {
    if (minutes < 5) return "< 5 min"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`
  }

  return (
    <Link href={`/establishment/${establishment.id}`} className="group block">
      <div className="service-card group-hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <Image
            src={imageUrl}
            alt={establishment.business_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              establishment.is_active
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {establishment.is_active ? "Open" : "Closed"}
            </div>
          </div>

          {/* Queue Count Badge */}
          {establishment.queueCount > 0 && (
            <div className="absolute top-3 left-3">
              <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                {establishment.queueCount}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
              {establishment.business_name}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {establishment.business_type}
            </p>
          </div>

          {/* Description */}
          {establishment.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {establishment.description}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{establishment.address}</span>
          </div>

          {/* Queue Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {formatEstimatedWait(establishment.estimatedWait)}
                </span>
              </div>
              {establishment.queueCount > 0 && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{establishment.queueCount} waiting</span>
                </div>
              )}
            </div>

            {/* Rating placeholder - could be calculated from reviews */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600">4.2</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}