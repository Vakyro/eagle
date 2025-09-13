"use client"

import { Home, Clock, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BottomNavProps {
  currentPage: "home" | "queue" | "admin" | "analytics"
  userType: "user" | "admin"
}

export function BottomNav({ currentPage, userType }: BottomNavProps) {
  const pathname = usePathname()

  const userNavItems = [
    { id: "home", label: "Discover", icon: Home, href: "/" },
    { id: "queue", label: "My Queue", icon: Clock, href: "/my-queue" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  const adminNavItems = [
    { id: "admin", label: "Dashboard", icon: Home, href: "/admin" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
  ]

  const navItems = userType === "admin" ? adminNavItems : userNavItems

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="content-container">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 scale-105"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
