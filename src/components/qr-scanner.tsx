"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, X, CheckCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isOpen, isScanning])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      setError("Camera access denied or not available")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const handleStartScan = () => {
    setIsScanning(true)
    setScannedResult(null)
  }

  const handleStopScan = () => {
    setIsScanning(false)
    stopCamera()
  }

  // Simulate QR code detection (in real app, use a QR scanning library)
  const simulateQRDetection = () => {
    const mockQRCodes = ["queue-1-1703123456789", "queue-2-1703123456790", "queue-3-1703123456791"]
    const randomCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)]
    setScannedResult(randomCode)
    onScan(randomCode)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden max-w-md w-full">
        <div className="p-4 border-b border-[#050315]/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#050315]">Scan QR Code</h3>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-[#050315] hover:bg-[#050315]/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!isScanning && !scannedResult && (
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-[#2772ce]" />
              <h4 className="text-lg font-medium text-[#050315] mb-2">Ready to Scan</h4>
              <p className="text-sm text-[#050315]/70 mb-6">Position the QR code within the camera frame to scan</p>
              <Button onClick={handleStartScan} className="bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isScanning && !scannedResult && (
            <div className="text-center">
              <div className="relative mb-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg object-cover" />
                <div className="absolute inset-0 border-2 border-[#2772ce] rounded-lg">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#2772ce]"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#2772ce]"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#2772ce]"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#2772ce]"></div>
                </div>
              </div>

              {error && (
                <div className="bg-[#9b5824]/10 border border-[#9b5824]/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-[#9b5824]">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleStopScan}
                  variant="outline"
                  className="flex-1 border-[#050315]/20 text-[#050315] hover:bg-[#050315]/5 bg-transparent"
                >
                  Stop
                </Button>
                <Button onClick={simulateQRDetection} className="flex-1 bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
                  Simulate Scan
                </Button>
              </div>
            </div>
          )}

          {scannedResult && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h4 className="text-lg font-medium text-[#050315] mb-2">QR Code Scanned!</h4>
              <div className="bg-[#050315]/5 rounded-lg p-3 mb-4">
                <p className="text-sm font-mono text-[#050315] break-all">{scannedResult}</p>
              </div>
              <Button onClick={onClose} className="bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
