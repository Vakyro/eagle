import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Users, Star } from "lucide-react"
import Link from "next/link"

interface Service {
  id: string
  name: string
  type: string
  isOpen: boolean
  estimatedWait: number
  queueCount: number
  lastUpdate: string
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="service-card bg-white border border-gray-200 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-yellow-100 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="absolute top-3 right-3">
          <div
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: service.isOpen ? "#16a34a" : "#dc2626",
              color: "#ffffff",
            }}
          >
            {service.isOpen ? "Open" : "Closed"}
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-white">4.5</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{service.name}</h3>
          <p className="text-sm text-gray-600">{service.type}</p>
        </div>

        {service.isOpen && (
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.estimatedWait} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{service.queueCount} waiting</span>
            </div>
          </div>
        )}

        <Link href={`/queue/${service.id}`}>
          <Button
            className="w-full font-medium border-0"
            style={{
              backgroundColor: service.isOpen ? "#2563eb" : "#e5e7eb",
              color: service.isOpen ? "#ffffff" : "#6b7280",
            }}
            disabled={!service.isOpen}
          >
            {service.isOpen ? "Join Queue" : "Currently Closed"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
