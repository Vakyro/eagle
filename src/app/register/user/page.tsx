"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    alert("Account created successfully!")
    router.push("/login")
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <Button type="submit" className="w-full bg-[#2772ce] hover:bg-blue-700 text-white">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
