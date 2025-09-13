"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { User, Bell, Shield, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserSettingsPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      console.log('No hay usuario en settings, redirigiendo al login')
      router.push("/login")
      return
    }

    if (user.userType === "establishment") {
      console.log('Usuario es establishment, redirigiendo al admin')
      router.push("/admin")
      return
    }

    console.log('Usuario válido en settings:', user.email)
  }, [user, isLoading, router])

  const handleLogout = async () => {
    console.log('Haciendo logout desde settings')
    await logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2772ce] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Se redirigirá al login
  }

  return (
    <>
      <div className="bg-blue-600 text-white">
        <div className="content-container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm opacity-90">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-4 bottom-nav-spacing">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>
            {user.firstName && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nombre</label>
                <Input value={`${user.firstName} ${user.lastName}`} disabled className="bg-gray-50" />
              </div>
            )}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Update Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Queue updates</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New restaurants</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full mb-3 bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Delete Account
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

      <BottomNav currentPage="settings" userType="user" />
    </>
  )
}
