"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

const statusOptions = ["ALL", "PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

interface Order {
  id: string
  userEmail: string
  userName: string | null
  productName: string
  totalAmount: number
  status: string
  createdAt: string
  quantity: number
  deliveryAddress: string
  city: string
  state: string
  zipCode: string
  country: string
}

export function OrdersPage() {
  const params = useParams()
  const sellerId = params.seller_id as string

  const [orders, setOrders] = useState<Order[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (sellerId) {
      fetchAllOrders()
    }
  }, [sellerId])

  const fetchAllOrders = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Fetching all orders for seller:", sellerId)
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/all-orders/${sellerId}`
      )

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok && data.msg === "Orders fetched successfully") {
        setOrders(data.data)
      } else {
        setError(data.msg || "Failed to fetch orders")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesEmail = order.userEmail.toLowerCase().includes(searchEmail.toLowerCase())
      const matchesStatus = filterStatus === "ALL" || order.status === filterStatus
      return matchesEmail && matchesStatus
    })
  }, [orders, searchEmail, filterStatus])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      PAID: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      PROCESSING: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      SHIPPED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      DELIVERED: "bg-green-500/10 text-green-700 dark:text-green-400",
      CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400",
      REFUNDED: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    }
    return colors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  }

  if (!sellerId) {
    return (
      <div className="p-8">
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">Seller ID not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="mt-2 text-muted-foreground">View and manage all customer orders</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Filters */}
      {!isLoading && (
        <div className="flex gap-4 mb-6 flex-col sm:flex-row">
          <Input
            placeholder="Search by customer email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card className="border-border">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Delivery Address</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground font-medium">{order.id.toString().slice(0, 8)}</td>
                        <td className="py-3 px-4 text-foreground">{order.userEmail}</td>
                        <td className="py-3 px-4 text-foreground">{order.productName}</td>
                        <td className="py-3 px-4 text-foreground">{order.quantity}</td>
                        <td className="py-3 px-4 text-foreground font-medium">${(order.totalAmount / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-foreground text-xs">
                          {order.deliveryAddress}, {order.city}, {order.state} {order.zipCode}
                        </td>
                        <td className="py-3 px-4 text-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}