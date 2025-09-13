// Restaurant Recommendations Service using Groq Cloud with Llama
export interface RestaurantFilters {
  venueType: string[]
  cuisineType: string[]
  musicType: string[]
  atmosphere: string[]
  priceRange: string[]
  features: string[]
  timeOfDay: string
  groupSize: number
}

export interface RecommendedRestaurant {
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

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ""
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"

/**
 * Get restaurant recommendations based on user preferences
 */
export async function getRestaurantRecommendations(filters: RestaurantFilters): Promise<RecommendedRestaurant[]> {
  try {
    const prompt = createRecommendationPrompt(filters)

    const payload = {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert restaurant recommendation system. You must respond ONLY with valid JSON array of restaurant objects. No additional text, explanations, or formatting. Each restaurant object must have exactly these fields: name, type, cuisine, description, atmosphere, priceRange, features (array), estimatedWait, rating (number), distance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    }

    console.log("🤖 Sending request to Groq Cloud...")

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No response from AI")
    }

    console.log("📝 Raw AI Response:", content)

    // Parse the JSON response
    try {
      const recommendations: RecommendedRestaurant[] = JSON.parse(content)

      // Validate the response structure
      if (!Array.isArray(recommendations)) {
        throw new Error("Response is not an array")
      }

      // Validate each restaurant object
      const validatedRecommendations = recommendations.map((restaurant, index) => {
        const required = ['name', 'type', 'cuisine', 'description', 'atmosphere', 'priceRange', 'features', 'estimatedWait', 'rating', 'distance']
        const missing = required.filter(field => !(field in restaurant))

        if (missing.length > 0) {
          console.warn(`Restaurant ${index} missing fields:`, missing)
          // Fill missing fields with defaults
          return {
            name: restaurant.name || `Restaurant ${index + 1}`,
            type: restaurant.type || "Restaurant",
            cuisine: restaurant.cuisine || "International",
            description: restaurant.description || "A great dining experience",
            atmosphere: restaurant.atmosphere || "Casual",
            priceRange: restaurant.priceRange || "$$",
            features: Array.isArray(restaurant.features) ? restaurant.features : [],
            estimatedWait: restaurant.estimatedWait || "15-25 min",
            rating: typeof restaurant.rating === 'number' ? restaurant.rating : 4.0,
            distance: restaurant.distance || "0.5 mi",
            ...restaurant
          }
        }

        return restaurant as RecommendedRestaurant
      })

      console.log("✅ Successfully parsed recommendations:", validatedRecommendations.length)
      return validatedRecommendations

    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError)
      console.log("Raw content:", content)

      // Fallback recommendations
      return getFallbackRecommendations(filters)
    }

  } catch (error) {
    console.error("❌ Error getting recommendations:", error)
    return getFallbackRecommendations(filters)
  }
}

/**
 * Create the prompt for the AI based on user filters
 */
function createRecommendationPrompt(filters: RestaurantFilters): string {
  let prompt = "Based on the following preferences, recommend exactly 6 restaurants that match the criteria:\n\n"

  if (filters.venueType.length > 0) {
    prompt += `Venue types preferred: ${filters.venueType.join(", ")}\n`
  }

  if (filters.cuisineType.length > 0) {
    prompt += `Cuisine types: ${filters.cuisineType.join(", ")}\n`
  }

  if (filters.musicType.length > 0) {
    prompt += `Music preferences: ${filters.musicType.join(", ")}\n`
  }

  if (filters.atmosphere.length > 0) {
    prompt += `Atmosphere: ${filters.atmosphere.join(", ")}\n`
  }

  if (filters.priceRange.length > 0) {
    prompt += `Price range: ${filters.priceRange.join(", ")}\n`
  }

  if (filters.features.length > 0) {
    prompt += `Desired features: ${filters.features.join(", ")}\n`
  }

  if (filters.timeOfDay) {
    prompt += `Time of visit: ${filters.timeOfDay}\n`
  }

  if (filters.groupSize > 0) {
    prompt += `Group size: ${filters.groupSize} people\n`
  }

  prompt += `\nRespond with a JSON array of exactly 6 restaurant objects. Each object must have:
- name: string
- type: string (restaurant, bar, club, etc.)
- cuisine: string
- description: string (2-3 sentences)
- atmosphere: string
- priceRange: string ($, $$, $$$, $$$$)
- features: string[] (array of features)
- estimatedWait: string (e.g., "15-25 min")
- rating: number (1-5)
- distance: string (e.g., "0.3 mi")

Make the recommendations diverse and realistic for a typical city. Include venues that match the specified preferences.`

  return prompt
}

/**
 * Fallback recommendations when AI fails
 */
function getFallbackRecommendations(filters: RestaurantFilters): RecommendedRestaurant[] {
  const fallbacks: RecommendedRestaurant[] = [
    {
      name: "The Golden Spoon",
      type: "Restaurant",
      cuisine: "International",
      description: "A contemporary dining experience with globally inspired dishes and elegant ambiance.",
      atmosphere: "Upscale Casual",
      priceRange: "$$$",
      features: ["Outdoor Seating", "Wine Bar", "Private Dining"],
      estimatedWait: "20-30 min",
      rating: 4.5,
      distance: "0.3 mi"
    },
    {
      name: "Sunset Lounge",
      type: "Bar & Restaurant",
      cuisine: "American",
      description: "Rooftop bar and grill with stunning city views and craft cocktails.",
      atmosphere: "Trendy",
      priceRange: "$$",
      features: ["Rooftop", "Live Music", "Craft Cocktails"],
      estimatedWait: "15-25 min",
      rating: 4.2,
      distance: "0.5 mi"
    },
    {
      name: "Bella Vista",
      type: "Restaurant",
      cuisine: "Italian",
      description: "Authentic Italian cuisine in a cozy, family-friendly atmosphere with fresh pasta made daily.",
      atmosphere: "Cozy",
      priceRange: "$$",
      features: ["Family-Friendly", "Fresh Pasta", "Wine Selection"],
      estimatedWait: "25-35 min",
      rating: 4.3,
      distance: "0.7 mi"
    },
    {
      name: "Neon Nights",
      type: "Club",
      cuisine: "Light Bites",
      description: "High-energy nightclub with top DJs, VIP sections, and a full bar.",
      atmosphere: "Energetic",
      priceRange: "$$$",
      features: ["DJ", "VIP Section", "Dancing", "Late Night"],
      estimatedWait: "30-45 min",
      rating: 4.0,
      distance: "0.8 mi"
    },
    {
      name: "Green Garden Café",
      type: "Café",
      cuisine: "Healthy",
      description: "Fresh, organic meals in a peaceful garden setting with vegetarian and vegan options.",
      atmosphere: "Peaceful",
      priceRange: "$",
      features: ["Outdoor Seating", "Vegan Options", "Organic"],
      estimatedWait: "10-15 min",
      rating: 4.1,
      distance: "0.4 mi"
    },
    {
      name: "The Sports Hub",
      type: "Sports Bar",
      cuisine: "American",
      description: "Sports bar with multiple screens, pub food, and a lively atmosphere for game watching.",
      atmosphere: "Casual",
      priceRange: "$$",
      features: ["Multiple TVs", "Sports", "Group Friendly"],
      estimatedWait: "15-20 min",
      rating: 3.9,
      distance: "0.6 mi"
    }
  ]

  // Filter fallbacks based on user preferences
  if (filters.venueType.length > 0) {
    return fallbacks.filter(restaurant =>
      filters.venueType.some(type =>
        restaurant.type.toLowerCase().includes(type.toLowerCase())
      )
    ).slice(0, 6)
  }

  return fallbacks
}