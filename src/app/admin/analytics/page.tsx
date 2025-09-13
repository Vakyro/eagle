"use client"

import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import {
  TrendingUp,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from "recharts"

interface AnalyticsData {
  dailyStats: Array<{
    day: string
    customers: number
    avgWaitTime: number
  }>
  weeklyStats: {
    totalCustomers: number
    avgWaitTime: number
    peakHour: string
    customerSatisfaction: number
  }
  monthlyComparison: {
    currentMonth: number
    lastMonth: number
    growth: number
  }
}

const COLORS = ['#2772ce', '#ddc248', '#48cc90', '#ff6b6b']

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userType = localStorage.getItem("userType")

    if (!userType) {
      router.push("/login")
      return
    }

    if (userType !== "admin") {
      router.push("/")
      return
    }

    setIsAuthenticated(true)

    // Mock analytics data
    const mockData: AnalyticsData = {
      dailyStats: [
        { day: "Mon", customers: 45, avgWaitTime: 12 },
        { day: "Tue", customers: 52, avgWaitTime: 15 },
        { day: "Wed", customers: 38, avgWaitTime: 8 },
        { day: "Thu", customers: 61, avgWaitTime: 18 },
        { day: "Fri", customers: 78, avgWaitTime: 22 },
        { day: "Sat", customers: 89, avgWaitTime: 25 },
        { day: "Sun", customers: 43, avgWaitTime: 10 }
      ],
      weeklyStats: {
        totalCustomers: 406,
        avgWaitTime: 15.7,
        peakHour: "7:00 PM",
        customerSatisfaction: 4.2
      },
      monthlyComparison: {
        currentMonth: 1624,
        lastMonth: 1456,
        growth: 11.5
      }
    }

    setAnalyticsData(mockData)
  }, [router])

  if (!isAuthenticated || !analyticsData) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const hourlyData = [
    { hour: "9 AM", customers: 12 },
    { hour: "10 AM", customers: 18 },
    { hour: "11 AM", customers: 25 },
    { hour: "12 PM", customers: 42 },
    { hour: "1 PM", customers: 38 },
    { hour: "2 PM", customers: 28 },
    { hour: "3 PM", customers: 22 },
    { hour: "4 PM", customers: 31 },
    { hour: "5 PM", customers: 45 },
    { hour: "6 PM", customers: 58 },
    { hour: "7 PM", customers: 67 },
    { hour: "8 PM", customers: 52 }
  ]

  const serviceTypeData = [
    { name: "Dine-in", value: 65, customers: 264 },
    { name: "Takeout", value: 25, customers: 102 },
    { name: "Delivery", value: 10, customers: 40 }
  ]

  return (
    <>
      <div className="bg-[#2772ce] text-white">
        <div className="content-container py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Analytics Dashboard</h1>
              <p className="text-sm opacity-90">Eagle Establishment Insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{analyticsData.weeklyStats.totalCustomers}</div>
                  <div className="text-sm text-white/70">This Week</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{analyticsData.weeklyStats.avgWaitTime}m</div>
                  <div className="text-sm text-white/70">Avg Wait</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-white">{analyticsData.monthlyComparison.growth}%</span>
                    <ArrowUp className="w-4 h-4 text-green-300" />
                  </div>
                  <div className="text-sm text-white/70">Growth</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{analyticsData.weeklyStats.peakHour}</div>
                  <div className="text-sm text-white/70">Peak Hour</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="content-container py-6 space-y-6 bottom-nav-spacing">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Customer Traffic</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#2772ce"
                  strokeWidth={3}
                  dot={{ fill: "#2772ce", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="customers" fill="#ddc248" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      `${value}% (${serviceTypeData.find(d => d.name === name)?.customers} customers)`,
                      name
                    ]}
                  />
                  <RechartsPieChart
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {serviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {serviceTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{analyticsData.weeklyStats.customerSatisfaction}/5</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{Math.round(analyticsData.weeklyStats.totalCustomers / 7)}</div>
              <div className="text-sm text-gray-600">Daily Avg</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{analyticsData.monthlyComparison.currentMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{analyticsData.monthlyComparison.lastMonth}</div>
              <div className="text-sm text-gray-600">Last Month</div>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav currentPage="analytics" userType="admin" />
    </>
  )
}