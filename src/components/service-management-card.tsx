"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Users, Clock, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface Service {
  id: string
  name: string
  type: string
  isOpen: boolean
  queueCount: number
  maxCapacity: number
  hours: string
  createdAt: string
}

interface ServiceManagementCardProps {
  service: Service
  onToggle: (serviceId: string) => void
  onDelete: (serviceId: string) => void
}

export function ServiceManagementCard({ service, onToggle, onDelete }: ServiceManagementCardProps) {
  return (
    <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#050315]">{service.name}</h3>
            <p className="text-sm text-[#050315]/70">{service.type}</p>
            <p className="text-xs text-[#050315]/50 mt-1">{service.hours}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#050315]/70">{service.isOpen ? "Open" : "Closed"}</span>
            <Switch
              checked={service.isOpen}
              onCheckedChange={() => onToggle(service.id)}
              className="data-[state=checked]:bg-[#2772ce]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#050315]/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-[#2772ce]" />
            </div>
            <div className="text-lg font-bold text-[#050315]">{service.queueCount}</div>
            <div className="text-xs text-[#050315]/70">in queue</div>
          </div>

          <div className="bg-[#050315]/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-[#ddc248]" />
            </div>
            <div className="text-lg font-bold text-[#050315]">{service.maxCapacity}</div>
            <div className="text-xs text-[#050315]/70">max capacity</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/queue/${service.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#2772ce] text-[#2772ce] hover:bg-[#2772ce] hover:text-white bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" />
              Manage Queue
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => onDelete(service.id)}
            className="border-[#9b5824] text-[#9b5824] hover:bg-[#9b5824] hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
