"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardMetrics {
  totalUsers: number
  totalMerchants: number
  pendingApprovals: number
  approvedMerchants: number
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Update this URL to match your Node.js backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant/dashboard-metrics`)

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const data = await res.json()
        setMetrics(data.metrics)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch metrics:", err)
        setError("Failed to load dashboard metrics")
        // Set mock data on error for demo purposes
        setMetrics({
          totalUsers: 156,
          totalMerchants: 42,
          pendingApprovals: 8,
          approvedMerchants: 34,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const metricCards = [
    { title: "Total Users", value: metrics?.totalUsers, loading },
    { title: "Total Merchants", value: metrics?.totalMerchants, loading },
    { title: "Pending Approvals", value: metrics?.pendingApprovals, loading },
    { title: "Approved Merchants", value: metrics?.approvedMerchants, loading },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error} - Using sample data</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {metric.loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}