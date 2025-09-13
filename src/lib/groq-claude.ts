// Groq Claude Integration - AI Assistant for Queue Management
import { QueueStats } from './queue-management'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface GroqClaude {
  apiKey: string
  enabled: boolean
  endpoint: string
}

// Configuración por defecto
const DEFAULT_CONFIG: GroqClaude = {
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
  enabled: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
  endpoint: "https://api.groq.com/openai/v1/chat/completions"
}

/**
 * Envía un mensaje a Claude a través de Groq
 */
export async function sendMessageToClaude(
  messages: ChatMessage[],
  context?: {
    queueStats?: QueueStats
    businessName?: string
    serviceType?: string
  }
): Promise<string | null> {
  if (!DEFAULT_CONFIG.enabled) {
    console.warn("⚠️ Groq API key not configured")
    return null
  }

  try {
    const systemPrompt = createSystemPrompt(context)

    const payload = {
      model: "mixtral-8x7b-32768", // Usando Mixtral como alternativa gratuita a Claude
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1024
    }

    const response = await fetch(DEFAULT_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEFAULT_CONFIG.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error("❌ Groq API error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null

  } catch (error) {
    console.error("❌ Error calling Groq API:", error)
    return null
  }
}

/**
 * Crea el prompt del sistema con contexto de la cola
 */
function createSystemPrompt(context?: {
  queueStats?: QueueStats
  businessName?: string
  serviceType?: string
}): string {
  let prompt = `You are an intelligent queue management assistant for Eagle, a queue management application. You help customers and business owners with questions about queues, wait times, and service information.

Current context:
`

  if (context?.businessName) {
    prompt += `- Business: ${context.businessName}\n`
  }

  if (context?.serviceType) {
    prompt += `- Service Type: ${context.serviceType}\n`
  }

  if (context?.queueStats) {
    prompt += `- Current Queue Stats:
  * People waiting: ${context.queueStats.totalWaiting}
  * People called: ${context.queueStats.totalCalled}
  * People served today: ${context.queueStats.totalServed}
  * Average wait time: ${context.queueStats.averageWaitTime} minutes
`
  }

  prompt += `
Be helpful, concise, and friendly. Focus on queue-related topics and provide practical advice about wait times, queue management, and customer service.

If asked about technical issues, suggest contacting support. Keep responses under 200 words when possible.`

  return prompt
}

/**
 * Genera sugerencias inteligentes para mejorar la gestión de colas
 */
export async function getQueueManagementSuggestions(
  queueStats: QueueStats,
  businessContext: {
    businessName: string
    serviceType: string
    maxCapacity: number
    currentCapacity: number
  }
): Promise<string | null> {
  const occupancyRate = (businessContext.currentCapacity / businessContext.maxCapacity) * 100

  const messages: ChatMessage[] = [{
    role: 'user',
    content: `I'm managing a ${businessContext.serviceType.toLowerCase()} called "${businessContext.businessName}". Current situation:

- ${queueStats.totalWaiting} people waiting
- ${queueStats.totalCalled} people called
- ${queueStats.totalServed} people served today
- Average wait time: ${queueStats.averageWaitTime} minutes
- Occupancy rate: ${occupancyRate.toFixed(1)}%
- Max capacity: ${businessContext.maxCapacity}

Can you provide 2-3 specific suggestions to improve queue management and customer experience?`
  }]

  const response = await sendMessageToClaude(messages, {
    queueStats,
    businessName: businessContext.businessName,
    serviceType: businessContext.serviceType
  })

  return response
}

/**
 * Responde preguntas de clientes sobre colas
 */
export async function answerCustomerQuestion(
  question: string,
  serviceContext: {
    serviceName: string
    serviceType: string
    currentWaitTime: number
    queuePosition?: number
    estimatedTime?: number
  }
): Promise<string | null> {
  const messages: ChatMessage[] = [{
    role: 'user',
    content: question
  }]

  const contextPrompt = `Customer asking about: ${serviceContext.serviceName} (${serviceContext.serviceType})
Current wait time: ${serviceContext.currentWaitTime} minutes
${serviceContext.queuePosition ? `Queue position: #${serviceContext.queuePosition}` : ''}
${serviceContext.estimatedTime ? `Estimated wait: ${serviceContext.estimatedTime} minutes` : ''}

Please answer the customer's question helpfully and professionally.`

  const response = await sendMessageToClaude([
    { role: 'system', content: contextPrompt },
    ...messages
  ])

  return response
}

/**
 * Configura la API key de Groq
 */
export function updateGroqApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('groq_api_key', apiKey)
    DEFAULT_CONFIG.apiKey = apiKey
    DEFAULT_CONFIG.enabled = !!apiKey
    console.log(`🔧 Groq API key updated`)
  }
}

/**
 * Obtiene la API key desde localStorage o variable de entorno
 */
export function getGroqApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('groq_api_key')
    if (stored) return stored
  }
  return DEFAULT_CONFIG.apiKey
}

/**
 * Verifica si Groq está configurado correctamente
 */
export function isGroqConfigured(): boolean {
  const apiKey = getGroqApiKey()
  return !!apiKey && apiKey.length > 0
}

/**
 * Prueba la conexión con Groq
 */
export async function testGroqConnection(): Promise<{ success: boolean; message: string }> {
  if (!isGroqConfigured()) {
    return { success: false, message: "API key not configured" }
  }

  try {
    const testMessage: ChatMessage[] = [{
      role: 'user',
      content: 'Hello, please respond with "Connection successful" if you can read this message.'
    }]

    const response = await sendMessageToClaude(testMessage)

    if (response && response.toLowerCase().includes('connection successful')) {
      return { success: true, message: "Connection successful!" }
    } else if (response) {
      return { success: true, message: `Connected, but got unexpected response: ${response.substring(0, 50)}...` }
    } else {
      return { success: false, message: "No response received from API" }
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}