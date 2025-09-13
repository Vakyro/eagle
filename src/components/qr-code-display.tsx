"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { useEffect, useRef } from "react"

interface QRCodeDisplayProps {
  value: string
  size?: number
  title?: string
  subtitle?: string
}

export function QRCodeDisplay({ value, size = 200, title, subtitle }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      generateQRCode(value, canvasRef.current, size)
    }
  }, [value, size])

  const generateQRCode = (text: string, canvas: HTMLCanvasElement, size: number) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Simple QR code pattern generation (in real app, use qrcode library)
    const moduleCount = 21
    const moduleSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Generate pattern based on text hash
    const hash = simpleHash(text)
    ctx.fillStyle = "#050315"

    // Draw finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize)
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize)
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize)

    // Draw data modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (shouldDrawModule(row, col, hash, moduleCount)) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Outer 7x7 square
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)
    ctx.fillStyle = "#050315"
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
  }

  const simpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  const shouldDrawModule = (row: number, col: number, hash: number, moduleCount: number): boolean => {
    // Skip finder patterns
    if ((row < 9 && col < 9) || (row < 9 && col >= moduleCount - 8) || (row >= moduleCount - 8 && col < 9)) {
      return false
    }

    // Generate pattern based on position and hash
    return (row + col + hash) % 3 === 0
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = `qr-code-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const handleShare = async () => {
    if (canvasRef.current && navigator.share) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "qr-code.png", { type: "image/png" })
            await navigator.share({
              title: title || "QR Code",
              text: subtitle || "My queue QR code",
              files: [file],
            })
          }
        })
      } catch (error) {
        console.log("Sharing not supported")
      }
    }
  }

  return (
    <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
      <div className="p-6 text-center">
        {title && <h3 className="text-lg font-semibold text-[#050315] mb-2">{title}</h3>}
        {subtitle && <p className="text-sm text-[#050315]/70 mb-4">{subtitle}</p>}

        <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-inner">
          <canvas ref={canvasRef} className="block" style={{ maxWidth: "100%", height: "auto" }} />
        </div>

        <div className="text-xs text-[#050315]/50 mb-4 font-mono break-all bg-[#050315]/5 p-2 rounded">{value}</div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="border-[#2772ce] text-[#2772ce] hover:bg-[#2772ce] hover:text-white bg-transparent"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          {navigator.share && (
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-[#2772ce] text-[#2772ce] hover:bg-[#2772ce] hover:text-white bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
