"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { registerBasicEstablishment } from "@/lib/basic-auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EstablishmentRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
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

    if (!formData.businessType) {
      setError("Please select a business type")
      setLoading(false)
      return
    }

    try {
      const result = await registerBasicEstablishment({
        businessName: formData.businessName,
        businessType: formData.businessType,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        password: formData.password
      })

      if (result.success && result.sessionToken) {
        await login(result.sessionToken)
        router.push("/admin")
      } else {
        setError(result.error || "Error en el registro")
      }
    } catch (error: any) {
      setError(`Error: ${error.message || 'Error desconocido'}`)
      console.error("Error de registro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <Link href="/login" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-[#050315]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#050315]">Register Business</h1>
            <p className="text-gray-600">Create your establishment account</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#050315]">Business Registration</CardTitle>
            <CardDescription>Fill in your business information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  disabled={loading}
                />
                <Select onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="clinic">Medical Clinic</SelectItem>
                    <SelectItem value="salon">Beauty Salon</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="government">Government Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Owner/Manager Name"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
                disabled={loading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
                <Input
                  type="tel"
                  placeholder="Business Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <Input
                placeholder="Business Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                disabled={loading}
              />
              <Textarea
                placeholder="Business Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={loading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Creating Account..." : "Register Business"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
