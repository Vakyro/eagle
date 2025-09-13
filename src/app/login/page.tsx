"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { loginBasicUser, loginBasicEstablishment } from "@/lib/basic-auth"
import Link from "next/link"

export default function LoginPage() {
  const [userCredentials, setUserCredentials] = useState({ email: "", password: "" })
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" })
  const [userLoading, setUserLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [userError, setUserError] = useState("")
  const [adminError, setAdminError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserLoading(true)
    setUserError("")

    try {
      const result = await loginBasicUser(userCredentials.email, userCredentials.password)

      if (result.success && result.sessionToken) {
        await login(result.sessionToken)
        router.push("/")
      } else {
        setUserError(result.error || "Error de login")
      }
    } catch (error: any) {
      setUserError(`Error: ${error.message || 'Error desconocido'}`)
      console.error("Error de login:", error)
    } finally {
      setUserLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError("")

    try {
      const result = await loginBasicEstablishment(adminCredentials.email, adminCredentials.password)

      if (result.success && result.sessionToken) {
        await login(result.sessionToken)
        router.push("/admin")
      } else {
        setAdminError(result.error || "Error de login")
      }
    } catch (error: any) {
      setAdminError(`Error: ${error.message || 'Error desconocido'}`)
      console.error("Error de login admin:", error)
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#050315] mb-2">Eagle</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user" className="text-sm">
              User Login
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-sm">
              Admin Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#050315]">User Login</CardTitle>
                <CardDescription>Access your queue status and join new queues</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  {userError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {userError}
                    </div>
                  )}
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={userCredentials.email}
                      onChange={(e) => setUserCredentials({ ...userCredentials, email: e.target.value })}
                      required
                      className="w-full"
                      disabled={userLoading}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={userCredentials.password}
                      onChange={(e) => setUserCredentials({ ...userCredentials, password: e.target.value })}
                      required
                      className="w-full"
                      disabled={userLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white" disabled={userLoading}>
                    {userLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Link href="/register/user" className="text-[#2772ce] hover:underline text-sm">
                      Don't have an account? Create one
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#050315]">Admin Login</CardTitle>
                <CardDescription>Manage your establishment and queues</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {adminError}
                    </div>
                  )}
                  <div>
                    <Input
                      type="email"
                      placeholder="Business Email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                      required
                      className="w-full"
                      disabled={adminLoading}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      required
                      className="w-full"
                      disabled={adminLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white" disabled={adminLoading}>
                    {adminLoading ? "Signing In..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Link href="/register/establishment" className="text-[#2772ce] hover:underline text-sm">
                      Don't have a business account? Register
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
