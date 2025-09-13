"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { Building, Bell, Shield, LogOut, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const email = localStorage.getItem("userEmail")

    if (!userType || !email) {
      router.push("/login")
      return
    }

    if (userType !== "admin") {
      router.push("/")
      return
    }

    setAdminEmail(email)
    setIsAuthenticated(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-blue-600 text-white">
        <div className="content-container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Business Settings</h1>
              <p className="text-sm opacity-90">Manage your business account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Information
            </CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Business Email</label>
              <Input value={adminEmail} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Business Name</label>
              <Input placeholder="Enter business name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Business Address</label>
              <Input placeholder="Enter business address" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Update Business Info</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Queue Management
            </CardTitle>
            <CardDescription>Configure your queue settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Default Queue Capacity</label>
              <Input type="number" placeholder="50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Average Service Time (minutes)</label>
              <Input type="number" placeholder="15" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Queue Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New queue joins</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Queue capacity alerts</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily reports</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full mb-3 bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav currentPage="settings" userType="admin" />
    </>
  )
}
