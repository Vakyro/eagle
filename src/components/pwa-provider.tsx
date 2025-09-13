"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X, Wifi, WifiOff } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 5000) // Hide after 5 seconds
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the A2HS prompt")
    } else {
      console.log("User dismissed the A2HS prompt")
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
  }

  return (
    <>
      {children}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
          <Card className="bg-white border border-gray-200 shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-eagle-blue rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Install Eagle</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add Eagle to your home screen for quick access and offline functionality.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-eagle-blue hover:bg-eagle-blue/90 text-white"
                  >
                    Install
                  </Button>
                  <Button
                    onClick={dismissInstallPrompt}
                    variant="outline"
                    size="sm"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
              <Button
                onClick={dismissInstallPrompt}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Offline Indicator */}
      {showOfflineMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
          <Card className="bg-gray-900 text-white border-0 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-gray-300" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">You're offline</h3>
                <p className="text-sm text-gray-300">
                  Some features may be limited, but you can still use cached content.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Online Indicator (brief) */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm">
            <WifiOff className="w-4 h-4 inline mr-2" />
            No internet connection
          </div>
        </div>
      )}
    </>
  )
}