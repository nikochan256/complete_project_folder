"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge, type VerificationStatus } from "@/components/admin/status-badge"
import { MerchantDetailModal } from "@/components/merchantDets" 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"

interface Merchant {
  id: string
  name: string
  category: string
  city: string
  phone: string
  email: string
  verification_status: VerificationStatus
  created_at: string
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10

  const fetchMerchants = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/merchant`)

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      setMerchants(data.merchants || [])
      setFilteredMerchants(data.merchants || [])
      setError(null)
    } catch (err) {
      console.error("Failed to fetch merchants:", err)
      setError("Failed to load merchants")
      // Set mock data on error
      const mockMerchants: Merchant[] = [
        {
          id: "1",
          name: "Tech Store",
          category: "Electronics",
          city: "New York",
          phone: "+1234567890",
          email: "tech@store.com",
          verification_status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Fashion Hub",
          category: "Clothing",
          city: "Los Angeles",
          phone: "+0987654321",
          email: "fashion@hub.com",
          verification_status: "approved",
          created_at: new Date().toISOString(),
        },
      ]
      setMerchants(mockMerchants)
      setFilteredMerchants(mockMerchants)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [])

  useEffect(() => {
    const filtered = merchants.filter(
      (merchant) =>
        merchant.name.toLowerCase().includes(search.toLowerCase()) ||
        merchant.category.toLowerCase().includes(search.toLowerCase()) ||
        merchant.city.toLowerCase().includes(search.toLowerCase()) ||
        merchant.email.toLowerCase().includes(search.toLowerCase()),
    )
    setFilteredMerchants(filtered)
    setPage(1)
  }, [search, merchants])

  const handleViewMerchant = (merchantId: string) => {
    setSelectedMerchant(merchantId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMerchant(null)
  }

  const handleMerchantUpdate = () => {
    fetchMerchants()
  }

  const start = (page - 1) * pageSize
  const paginatedMerchants = filteredMerchants.slice(start, start + pageSize)
  const totalPages = Math.ceil(filteredMerchants.length / pageSize)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Merchants</h1>
        <p className="text-muted-foreground mt-1">View and manage merchant accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Merchants ({filteredMerchants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name, category, city, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">{error} - Showing sample data</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMerchants.map((merchant) => (
                      <TableRow key={merchant.id}>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>{merchant.category}</TableCell>
                        <TableCell>{merchant.city}</TableCell>
                        <TableCell>{merchant.phone}</TableCell>
                        <TableCell className="text-sm">{merchant.email}</TableCell>
                        <TableCell>
                          <StatusBadge status={merchant.verification_status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(merchant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewMerchant(merchant.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginatedMerchants.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No merchants found</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-3 py-1 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Merchant Detail Modal */}
      {selectedMerchant && (
        <MerchantDetailModal
          merchantId={selectedMerchant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleMerchantUpdate}
        />
      )}
    </div>
  )
}