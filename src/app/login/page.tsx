"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function LoginPage() {
  const [userCredentials, setUserCredentials] = useState({ email: "", password: "" })
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" })
  const router = useRouter()

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("userType", "user")
    localStorage.setItem("userEmail", userCredentials.email)
    router.push("/")
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("userType", "admin")
    localStorage.setItem("userEmail", adminCredentials.email)
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#050315] mb-2">QueueUp</h1>
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
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={userCredentials.email}
                      onChange={(e) => setUserCredentials({ ...userCredentials, email: e.target.value })}
                      required
                      className="w-full"
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
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white">
                    Sign In
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
                  <div>
                    <Input
                      type="email"
                      placeholder="Business Email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                      required
                      className="w-full"
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
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white">
                    Sign In
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
