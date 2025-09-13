// AI Prediction Service - FastAPI Integration
export interface AIPredictionResult {
  personas: number
  tiempo_estimado: number
  ocupacion: number
}

export interface AIPredictionConfig {
  ngrokUrl: string
  imageUrl?: string
  enabled: boolean
}

// Configuración por defecto
const DEFAULT_CONFIG: AIPredictionConfig = {
  ngrokUrl: process.env.NEXT_PUBLIC_NGROK_URL || "https://08acd1c92046.ngrok-free.app",
  imageUrl: "https://whjeyftuqpucifupfdps.supabase.co/storage/v1/object/public/nomas/restaurante.webp",
  enabled: true
}

/**
 * Llama a la API de FastAPI para obtener predicción de tiempo de espera basada en YOLO
 */
export async function getAIPrediction(config: Partial<AIPredictionConfig> = {}): Promise<AIPredictionResult | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  if (!finalConfig.enabled) {
    console.log("🚫 AI Prediction disabled")
    return null
  }

  if (finalConfig.ngrokUrl.includes("YOUR_NGROK_URL_HERE")) {
    console.warn("⚠️ Please update NEXT_PUBLIC_NGROK_URL environment variable with your actual ngrok URL")
    return null
  }

  try {
    console.log("🚀 Calling FastAPI:", finalConfig.ngrokUrl)

    // Hacer predicción directamente sin health check para simplificar
    const predictRes = await fetch(`${finalConfig.ngrokUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        image_url: finalConfig.imageUrl
      }),
      mode: 'cors' // Explícitamente habilitar CORS
    })

    console.log("📡 Response status:", predictRes.status)

    if (!predictRes.ok) {
      const errorText = await predictRes.text()
      console.warn("⚠️ Predict request failed:", predictRes.status, errorText)
      return null
    }

    const result: AIPredictionResult = await predictRes.json()

    console.log(`🤖 AI Prediction successful: ${result.personas} personas, ${result.tiempo_estimado} min wait, ${result.ocupacion}% ocupación`)

    return result
  } catch (error) {
    console.error("❌ FastAPI call failed with error:", error)

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error("🔍 This is likely a CORS or network connectivity issue")
      console.error("🔧 Make sure:")
      console.error("   1. Your FastAPI server is running")
      console.error("   2. CORS is properly configured")
      console.error("   3. The ngrok URL is correct:", finalConfig.ngrokUrl)
    }

    return null
  }
}

/**
 * Combina la predicción de IA con datos de cola tradicionales
 */
export function combineAIWithTraditional(
  aiPrediction: AIPredictionResult | null,
  queueCount: number,
  avgServiceTime: number = 15
): number {
  if (!aiPrediction) {
    // Método tradicional
    return Math.max(5, queueCount * avgServiceTime)
  }

  // Combinar predicción de IA con datos de cola actual
  const queueBasedTime = queueCount * avgServiceTime
  const aiWeight = 0.7 // 70% peso a IA
  const queueWeight = 0.3 // 30% peso a cola tradicional

  const combinedTime = Math.round(
    (aiPrediction.tiempo_estimado * aiWeight) + (queueBasedTime * queueWeight)
  )

  return Math.max(5, combinedTime)
}

/**
 * Actualiza la configuración de la URL de ngrok
 */
export function updateNgrokUrl(newUrl: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ngrok_url', newUrl)
    console.log(`🔧 Ngrok URL updated to: ${newUrl}`)
  }
}

/**
 * Obtiene la URL de ngrok desde localStorage o variable de entorno
 */
export function getNgrokUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ngrok_url')
    if (stored) return stored
  }
  return DEFAULT_CONFIG.ngrokUrl
}