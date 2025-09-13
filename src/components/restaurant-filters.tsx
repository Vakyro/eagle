"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Sparkles, Loader2 } from "lucide-react"
import { getRestaurantRecommendations, type RestaurantFilters, type RecommendedRestaurant } from "@/lib/restaurant-recommendations"

interface RestaurantFiltersProps {
  onRecommendations: (restaurants: RecommendedRestaurant[]) => void
}

export function RestaurantFiltersModal({ onRecommendations }: RestaurantFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<RestaurantFilters>({
    venueType: [],
    cuisineType: [],
    musicType: [],
    atmosphere: [],
    priceRange: [],
    features: [],
    timeOfDay: "",
    groupSize: 2
  })

  const venueOptions = [
    "Restaurant",
    "Bar",
    "Club",
    "Café",
    "Bistro",
    "Pub",
    "Fine Dining",
    "Fast Casual",
    "Sports Bar",
    "Rooftop",
    "Lounge"
  ]

  const cuisineOptions = [
    "Italian",
    "Mexican",
    "Asian",
    "American",
    "French",
    "Indian",
    "Japanese",
    "Thai",
    "Mediterranean",
    "Chinese",
    "Korean",
    "Greek",
    "Spanish",
    "Brazilian",
    "International"
  ]

  const musicOptions = [
    "Live Music",
    "Jazz",
    "Rock",
    "Pop",
    "Electronic",
    "Classical",
    "Acoustic",
    "DJ",
    "No Music",
    "Background Music",
    "Country",
    "Latin",
    "Hip-Hop"
  ]

  const atmosphereOptions = [
    "Romantic",
    "Casual",
    "Upscale",
    "Cozy",
    "Lively",
    "Quiet",
    "Family-Friendly",
    "Trendy",
    "Traditional",
    "Modern",
    "Rustic",
    "Elegant",
    "Energetic",
    "Peaceful"
  ]

  const priceRangeOptions = [
    "$",
    "$$",
    "$$$",
    "$$$$"
  ]

  const featureOptions = [
    "Outdoor Seating",
    "Private Dining",
    "Valet Parking",
    "Wi-Fi",
    "Pet-Friendly",
    "Wheelchair Accessible",
    "Reservations Available",
    "Takeout",
    "Delivery",
    "Happy Hour",
    "Brunch",
    "Late Night",
    "Wine Bar",
    "Craft Cocktails",
    "Vegan Options",
    "Gluten-Free Options"
  ]

  const timeOptions = [
    { value: "breakfast", label: "Breakfast (7AM-11AM)" },
    { value: "brunch", label: "Brunch (10AM-2PM)" },
    { value: "lunch", label: "Lunch (11AM-3PM)" },
    { value: "afternoon", label: "Afternoon (2PM-5PM)" },
    { value: "dinner", label: "Dinner (5PM-10PM)" },
    { value: "late-night", label: "Late Night (10PM+)" }
  ]

  const handleCheckboxChange = (category: keyof RestaurantFilters, value: string, checked: boolean) => {
    if (Array.isArray(filters[category])) {
      const currentArray = filters[category] as string[]
      if (checked) {
        setFilters(prev => ({
          ...prev,
          [category]: [...currentArray, value]
        }))
      } else {
        setFilters(prev => ({
          ...prev,
          [category]: currentArray.filter(item => item !== value)
        }))
      }
    }
  }

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Getting recommendations with filters:", filters)
      const recommendations = await getRestaurantRecommendations(filters)
      onRecommendations(recommendations)
      setIsOpen(false)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllFilters = () => {
    setFilters({
      venueType: [],
      cuisineType: [],
      musicType: [],
      atmosphere: [],
      priceRange: [],
      features: [],
      timeOfDay: "",
      groupSize: 2
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'groupSize') return value !== 2
    if (key === 'timeOfDay') return value !== ""
    return Array.isArray(value) && value.length > 0
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="responsive-modal sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Restaurant Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Venue Type */}
          <div>
            <Label className="text-base font-semibold">Venue Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
              {venueOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`venue-${option}`}
                    checked={filters.venueType.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('venueType', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`venue-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cuisine Type */}
          <div>
            <Label className="text-base font-semibold">Cuisine Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
              {cuisineOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${option}`}
                    checked={filters.cuisineType.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('cuisineType', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`cuisine-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Music Type */}
          <div>
            <Label className="text-base font-semibold">Music Preference</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
              {musicOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`music-${option}`}
                    checked={filters.musicType.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('musicType', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`music-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Atmosphere */}
          <div>
            <Label className="text-base font-semibold">Atmosphere</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
              {atmosphereOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`atmosphere-${option}`}
                    checked={filters.atmosphere.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('atmosphere', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`atmosphere-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-base font-semibold">Price Range</Label>
            <div className="flex gap-4 mt-2">
              {priceRangeOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${option}`}
                    checked={filters.priceRange.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('priceRange', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`price-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label className="text-base font-semibold">Features</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2">
              {featureOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${option}`}
                    checked={filters.features.includes(option)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('features', option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`feature-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <Label className="text-base font-semibold">Time of Visit</Label>
            <Select
              value={filters.timeOfDay}
              onValueChange={(value) => setFilters(prev => ({ ...prev, timeOfDay: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select time of day" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Size */}
          <div>
            <Label className="text-base font-semibold">
              Group Size: {filters.groupSize} {filters.groupSize === 1 ? 'person' : 'people'}
            </Label>
            <div className="mt-3">
              <Slider
                value={[filters.groupSize]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, groupSize: value[0] }))}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span>6</span>
                <span>12+</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGetRecommendations}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Get Recommendations
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}