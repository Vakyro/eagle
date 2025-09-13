import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PWAProvider } from "@/components/pwa-provider"
import { PWAHead } from "@/components/pwa-head"
import "./globals.css"

export const metadata: Metadata = {
  title: "Eagle - Queue Management System",
  description: "Advanced queue management for your establishment",
  generator: "Eagle PWA",
  manifest: "/manifest.json",
  themeColor: "#2772ce",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eagle",
    startupImage: [
      {
        url: "/icon-512.jpg",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  applicationName: "Eagle",
  keywords: ["queue", "management", "business", "pwa", "eagle"],
  authors: [{ name: "Eagle Team" }],
  robots: "index,follow",
  openGraph: {
    type: "website",
    siteName: "Eagle",
    title: "Eagle - Queue Management System",
    description: "Advanced queue management for your establishment",
    images: ["/icon-512.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Eagle - Queue Management System",
    description: "Advanced queue management for your establishment",
    images: ["/icon-512.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <PWAHead />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <PWAProvider>
          <div className="app-container">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </PWAProvider>
        <Analytics />
      </body>
    </html>
  )
}
