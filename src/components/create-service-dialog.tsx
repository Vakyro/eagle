"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Service {
  name: string
  type: string
  isOpen: boolean
  queueCount: number
  maxCapacity: number
  hours: string
}

interface CreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateService: (service: Service) => void
}

export function CreateServiceDialog({ open, onOpenChange, onCreateService }: CreateServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    maxCapacity: "20",
    hours: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.maxCapacity || !formData.hours) {
      return
    }

    const service: Service = {
      name: formData.name,
      type: formData.type,
      isOpen: true,
      queueCount: 0,
      maxCapacity: Number.parseInt(formData.maxCapacity),
      hours: formData.hours,
    }

    onCreateService(service)

    // Reset form
    setFormData({
      name: "",
      type: "",
      maxCapacity: "20",
      hours: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#fbfbfe] border-none max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-[#050315]">Create New Service</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-[#050315]">
              Service Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bella Vista Restaurant"
              className="border-[#050315]/20 focus:border-[#2772ce]"
              required
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-[#050315]">
              Service Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="border-[#050315]/20 focus:border-[#2772ce]">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Café">Café</SelectItem>
                <SelectItem value="Bakery">Bakery</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
                <SelectItem value="Salon">Salon</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="capacity" className="text-[#050315]">
              Maximum Queue Capacity
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="200"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
              className="border-[#050315]/20 focus:border-[#2772ce]"
              required
            />
          </div>

          <div>
            <Label htmlFor="hours" className="text-[#050315]">
              Operating Hours
            </Label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="e.g., 9:00 AM - 6:00 PM"
              className="border-[#050315]/20 focus:border-[#2772ce]"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#050315]/20 text-[#050315] hover:bg-[#050315]/5"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#2772ce] hover:bg-[#2772ce]/90 text-white">
              Create Service
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
