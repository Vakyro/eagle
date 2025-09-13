"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, Users, Utensils, Music, DollarSign, Sparkles, X } from "lucide-react"
import { type RecommendedRestaurant } from "@/lib/restaurant-recommendations"

interface RecommendedRestaurantsProps {
  restaurants: RecommendedRestaurant[]
  onClear: () => void
}

export function RecommendedRestaurants({ restaurants, onClear }: RecommendedRestaurantsProps) {
  if (restaurants.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-[#050315]">
            AI Recommendations
          </h2>
          <Badge variant="secondary" className="ml-2">
            {restaurants.length} found
          </Badge>
        </div>
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <div className="responsive-grid gap-3 sm:gap-4">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard key={index} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}

function RestaurantCard({ restaurant }: { restaurant: RecommendedRestaurant }) {
  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'text-green-600 bg-green-50'
      case '$$': return 'text-yellow-600 bg-yellow-50'
      case '$$$': return 'text-orange-600 bg-orange-50'
      case '$$$$': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
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
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="responsive-padding">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[#050315] text-lg leading-tight">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {restaurant.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {restaurant.cuisine}
              </Badge>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-sm font-semibold ${getPriceRangeColor(restaurant.priceRange)}`}>
            {restaurant.priceRange}
          </div>
        </div>

        {/* Rating and Distance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {getStars(restaurant.rating)}
            <span className="text-sm text-gray-600 ml-1">
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            {restaurant.distance}
          </div>
        </div>

        {/* Description */}
        <p className="responsive-text text-gray-700 leading-relaxed mb-4">
          {restaurant.description}
        </p>

        {/* Atmosphere */}
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {restaurant.atmosphere}
          </span>
        </div>

        {/* Wait Time */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Wait: {restaurant.estimatedWait}
          </span>
        </div>

        {/* Features */}
        {restaurant.features && restaurant.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {restaurant.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {restaurant.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{restaurant.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full bg-[#2772ce] hover:bg-[#1e5ba8] text-white"
          size="sm"
          onClick={() => {
            // Create a temporary queue for AI recommended restaurants
            const queueUrl = `/queue/ai-${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`
            window.location.href = queueUrl
          }}
        >
          <Users className="w-4 h-4 mr-2" />
          Join Queue
        </Button>
      </div>
    </Card>
  )
}