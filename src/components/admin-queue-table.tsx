"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, QrCode } from "lucide-react"

interface QueueMember {
  id: string
  name: string
  joinedAt: string
  position: number
  qrCode: string
  status: "waiting" | "called" | "served"
}

interface AdminQueueTableProps {
  queueMembers: QueueMember[]
  onServeCustomer: (memberId: string) => void
  onRemoveCustomer: (memberId: string) => void
}

export function AdminQueueTable({ queueMembers, onServeCustomer, onRemoveCustomer }: AdminQueueTableProps) {
  if (queueMembers.length === 0) {
    return null
  }

  return (
    <Card className="bg-[#fbfbfe] border-none shadow-lg rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#050315]/10">
        <h3 className="text-lg font-semibold text-[#050315]">Queue Members</h3>
      </div>

      <div className="divide-y divide-[#050315]/10">
        {queueMembers.map((member) => (
          <div key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      member.status === "waiting"
                        ? "bg-[#ddc248]"
                        : member.status === "called"
                          ? "bg-[#2772ce]"
                          : "bg-green-500"
                    }`}
                  />
                  <div className="font-medium text-[#050315]">{member.name}</div>
                  <div className="text-sm text-[#050315]/50">#{member.position}</div>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#050315]/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(member.joinedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    <span className="font-mono text-xs">{member.qrCode.slice(-8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.status === "waiting" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onServeCustomer(member.id)}
                      className="bg-[#2772ce] hover:bg-[#2772ce]/90 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Serve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveCustomer(member.id)}
                      className="border-[#9b5824] text-[#9b5824] hover:bg-[#9b5824] hover:text-white"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {member.status === "called" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onServeCustomer(member.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveCustomer(member.id)}
                      className="border-[#9b5824] text-[#9b5824] hover:bg-[#9b5824] hover:text-white"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
