"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Send, Settings, MessageCircle, CheckCircle, AlertCircle } from "lucide-react"
import {
  sendMessageToClaude,
  getQueueManagementSuggestions,
  answerCustomerQuestion,
  updateGroqApiKey,
  getGroqApiKey,
  isGroqConfigured,
  testGroqConnection,
  type ChatMessage
} from "@/lib/groq-claude"
import { getQueueStats, type QueueStats } from "@/lib/queue-management"

interface AIAssistantProps {
  serviceId?: string
  serviceName?: string
  serviceType?: string
  businessName?: string
  isAdmin?: boolean
}

export function AIAssistant({ serviceId, serviceName, serviceType, businessName, isAdmin }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)

  useEffect(() => {
    if (serviceId && isOpen) {
      loadQueueStats()
    }
  }, [serviceId, isOpen])

  const loadQueueStats = async () => {
    if (!serviceId) return
    try {
      const stats = await getQueueStats(serviceId)
      setQueueStats(stats)
    } catch (error) {
      console.error("Error loading queue stats:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isGroqConfigured()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let response: string | null = null

      if (isAdmin && queueStats) {
        // Para admins, generar sugerencias de gestión
        response = await getQueueManagementSuggestions(queueStats, {
          businessName: businessName || serviceName || "Business",
          serviceType: serviceType || "Service",
          maxCapacity: 50, // Hardcoded for demo
          currentCapacity: queueStats.totalWaiting + queueStats.totalCalled
        })
      } else if (serviceName && queueStats) {
        // Para clientes, responder preguntas sobre la cola
        response = await answerCustomerQuestion(inputValue, {
          serviceName: serviceName,
          serviceType: serviceType || "Service",
          currentWaitTime: queueStats.averageWaitTime,
          queuePosition: queueStats.totalWaiting + 1,
          estimatedTime: queueStats.averageWaitTime
        })
      } else {
        // Conversación general
        response = await sendMessageToClaude([...messages, userMessage])
      }

      if (response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "Sorry, I couldn't process your request right now. Please make sure the AI service is properly configured.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "An error occurred while processing your request. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isGroqConfigured()) {
    return <GroqConfigDialog />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bot className="w-4 h-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Assistant
            {serviceName && <span className="text-sm font-normal text-gray-500">• {serviceName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg max-h-80">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                {isAdmin ? (
                  "Ask me for queue management suggestions or general help!"
                ) : (
                  "Ask me about wait times, queue status, or any questions you have!"
                )}
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border p-3 rounded-lg text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GroqConfigDialog() {
  const [apiKey, setApiKey] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGroqApiKey())
    }
  }, [isOpen])

  const handleSave = () => {
    if (apiKey.trim()) {
      updateGroqApiKey(apiKey.trim())
      setIsOpen(false)
      setConnectionStatus('idle')
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setStatusMessage("Please enter an API key")
      setConnectionStatus('error')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    // Temporalmente actualizar la clave para la prueba
    updateGroqApiKey(apiKey.trim())

    try {
      const result = await testGroqConnection()

      if (result.success) {
        setStatusMessage(result.message)
        setConnectionStatus('success')
      } else {
        setStatusMessage(result.message)
        setConnectionStatus('error')
      }
    } catch (error) {
      setStatusMessage(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bot className="w-4 h-4" />
          Setup AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure AI Assistant
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq-api-key">Groq API Key</Label>
            <Input
              id="groq-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Get your free API key from{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.groq.com
              </a>
            </p>
          </div>

          {/* Connection Test */}
          <div className="space-y-2">
            <Button
              onClick={handleTestConnection}
              disabled={!apiKey.trim() || isTestingConnection}
              variant="outline"
              className="w-full"
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>

            {connectionStatus !== 'idle' && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                connectionStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {connectionStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}