"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  activeProducts: number
}

interface Order {
  id: string
  userEmail: string
  userName: string | null
  productName: string
  totalAmount: number
  status: string
  createdAt: string
}

export function DashboardPage() {
  const params = useParams()
  const sellerId = params.seller_id as string

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (sellerId) {
      fetchDashboardStats()
      fetchRecentOrders()
    }
  }, [sellerId])

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true)
    setError("")
    
    try {
      console.log("requrest sent fromt the frontend for dashboard stats")
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/dashboard-stats/${sellerId}`
      )
      const data = await response.json()

      if (response.ok && data.msg === "Dashboard stats fetched successfully") {
        setStats(data.data)
      } else {
        setError(data.msg || "Failed to fetch dashboard stats")
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError("Failed to load dashboard statistics")
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchRecentOrders = async () => {
    setIsLoadingOrders(true)
    
    try {
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/recent-orders/${sellerId}?limit=5`
      )
      const data = await response.json()

      if (response.ok && data.msg === "Recent orders fetched successfully") {
        setRecentOrders(data.data)
      } else {
        console.error("Failed to fetch recent orders:", data.msg)
      }
    } catch (err) {
      console.error("Error fetching recent orders:", err)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: "In inventory",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "All time",
    },
    {
      title: "Total Revenue",
      value: `$${(stats.totalRevenue / 100).toFixed(2)}`,
      description: "From all orders",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      description: stats.totalProducts > 0 
        ? `${Math.round((stats.activeProducts / stats.totalProducts) * 100)}% active`
        : "0% active",
    },
  ]

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "DELIVERED":
        return "default"
      case "SHIPPED":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back to your merchant dashboard</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoadingStats ? (
          <div className="col-span-full flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Orders */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-foreground font-medium">
                        {order.id.toString().slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {order.userName || order.userEmail}
                      </td>
                      <td className="py-3 px-4 text-foreground">{order.productName}</td>
                      <td className="py-3 px-4 text-foreground font-medium">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(order.status)} className="text-xs">
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}