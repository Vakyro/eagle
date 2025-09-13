"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, CheckCircle, AlertCircle, Globe } from "lucide-react"
import { getNgrokUrl, updateNgrokUrl, getAIPrediction } from "@/lib/ai-prediction"

export function NgrokConfig() {
  const [url, setUrl] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    // Cargar URL actual
    setUrl(getNgrokUrl())
  }, [isOpen])

  const handleSave = () => {
    if (url && url !== "https://08acd1c92046.ngrok-free.app") {
      updateNgrokUrl(url)
      setIsOpen(false)
      setConnectionStatus('idle')
    }
  }

  const handleTestConnection = async () => {
    if (!url || url.includes("YOUR_NGROK_URL_HERE")) {
      setStatusMessage("Please enter a valid ngrok URL")
      setConnectionStatus('error')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')

    try {
      console.log("🧪 Testing connection to:", url)

      // Hacer una prueba directa a la URL
      const testRes = await fetch(`${url}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          image_url: "https://whjeyftuqpucifupfdps.supabase.co/storage/v1/object/public/nomas/restaurante.webp"
        }),
        mode: 'cors'
      })

      console.log("📡 Test response status:", testRes.status)

      if (testRes.ok) {
        const result = await testRes.json()
        updateNgrokUrl(url)
        setStatusMessage(`✅ Connection successful! Detected ${result.personas} personas, estimated wait: ${result.tiempo_estimado} min`)
        setConnectionStatus('success')
      } else {
        const errorText = await testRes.text()
        setStatusMessage(`❌ Connection failed with status ${testRes.status}: ${errorText}`)
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error("Connection test error:", error)
      let errorMessage = "Connection failed"

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error - check if server is running and CORS is enabled"
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setStatusMessage(`❌ ${errorMessage}`)
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const isValidUrl = url && url.startsWith('https://') && !url.includes("YOUR_NGROK_URL_HERE")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          AI Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Prediction Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ngrok-url">Ngrok URL</Label>
            <Input
              id="ngrok-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://08acd1c92046.ngrok-free.app"
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Enter your ngrok URL that points to your FastAPI server with YOLO model
            </p>
          </div>

          {/* Connection Test */}
          <div className="space-y-2">
            <Button
              onClick={handleTestConnection}
              disabled={!isValidUrl || isTestingConnection}
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
              disabled={!isValidUrl}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function NgrokStatusCard() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const url = getNgrokUrl()
    setCurrentUrl(url)
    setIsConfigured(url && !url.includes("YOUR_NGROK_URL_HERE"))
  }, [])

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            AI Prediction Status
          </h3>
          <NgrokConfig />
        </div>

        <div className={`flex items-center gap-2 text-sm ${
          isConfigured ? 'text-green-600' : 'text-orange-600'
        }`}>
          {isConfigured ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>
            {isConfigured ? 'AI prediction configured' : 'AI prediction needs configuration'}
          </span>
        </div>

        {isConfigured && (
          <p className="text-xs text-gray-500 mt-2 font-mono break-all">
            {currentUrl}
          </p>
        )}
      </div>
    </Card>
  )
}