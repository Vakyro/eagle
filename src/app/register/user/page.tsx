"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { registerBasicUser } from "@/lib/basic-auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function UserRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      console.log("Registrando usuario básico...")

      const result = await registerBasicUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      if (result.success && result.sessionToken) {
        await login(result.sessionToken)
        router.push("/")
      } else {
        setError(result.error || "Error en el registro")
      }
    } catch (error: any) {
      console.error("Error de registro:", error)
      setError(`Error: ${error.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <Link href="/login" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-[#050315]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#050315]">Create Account</h1>
            <p className="text-gray-600">Join Eagle as a user</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#050315]">User Registration</CardTitle>
            <CardDescription>Fill in your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={loading}
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
