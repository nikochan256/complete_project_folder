"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MerchantDetailModal } from "@/components/merchantDets"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"

interface PendingMerchant {
  id: string
  name: string
  category: string
  city: string
  phone: string
  email: string
  created_at: string
}

export default function PendingApprovalsPage() {
  const [merchants, setMerchants] = useState<PendingMerchant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionMerchant, setActionMerchant] = useState<{ id: string; action: "approve" | "reject" } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const res = await fetch(`${API_URL}/merchant/pending`)

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      setMerchants(data.merchants || [])
      setError(null)
    } catch (err) {
      console.error("Failed to fetch pending merchants:", err)
      setError("Failed to load pending merchants")
      // Set mock data on error
      const mockMerchants: PendingMerchant[] = [
        {
          id: "1",
          name: "Green Cafe",
          category: "Food & Beverage",
          city: "Boston",
          phone: "+1234567890",
          email: "green@cafe.com",
          created_at: new Date().toISOString(),
        },
      ]
      setMerchants(mockMerchants)
    } finally {
      setLoading(false)
    }
  }

  const handleViewMerchant = (merchantId: string) => {
    setSelectedMerchant(merchantId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMerchant(null)
  }

  const handleInlineAction = async (merchantId: string, action: "approve" | "reject") => {
    console.log("Request sent from frontend")
    console.log("Action:", action)
    console.log("Merchant ID:", merchantId)
    
    // Validate rejection reason if rejecting
    if (action === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const requestBody: any = {
        kybStatus: action === "approve" ? "APPROVED" : "REJECTED",
      }

      // Only include rejection_reason if rejecting
      if (action === "reject") {
        requestBody.rejection_reason = rejectionReason.trim()
      }

      console.log("Request body:", JSON.stringify(requestBody))
      console.log("URL:", `${API_URL}/merchant/${merchantId}/verification`)

      const res = await fetch(`${API_URL}/merchant/${merchantId}/verification`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.log("Error data:", errorData)
        throw new Error(errorData.msg || "Failed to update")
      }

      const data = await res.json()
      console.log("Success data:", data)
      
      toast({
        title: "Success",
        description: data.msg || `Merchant ${action === "approve" ? "approved" : "rejected"}`,
      })
      
      // Reset states
      setActionMerchant(null)
      setRejectionReason("")
      await fetchMerchants()
    } catch (error: any) {
      console.error("Failed to update merchant:", error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} merchant`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogClose = () => {
    setActionMerchant(null)
    setRejectionReason("")
  }

  const handleConfirmAction = async () => {
    if (!actionMerchant) return
    
    await handleInlineAction(actionMerchant.id, actionMerchant.action)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {merchants.length} merchant{merchants.length !== 1 ? "s" : ""} awaiting approval
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Merchants</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchants.map((merchant) => (
                      <TableRow key={merchant.id}>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>{merchant.category}</TableCell>
                        <TableCell>{merchant.city}</TableCell>
                        <TableCell>{merchant.phone}</TableCell>
                        <TableCell className="text-sm">{merchant.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(merchant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewMerchant(merchant.id)}>
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setActionMerchant({ id: merchant.id, action: "approve" })}
                              disabled={submitting}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setActionMerchant({ id: merchant.id, action: "reject" })}
                              disabled={submitting}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {merchants.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending merchants</p>
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
          onUpdate={fetchMerchants}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={actionMerchant !== null} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {actionMerchant?.action === "approve" ? "Approve Merchant" : "Reject Merchant"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionMerchant?.action === "approve"
              ? "Are you sure you want to approve this merchant? They will be notified via email."
              : "Are you sure you want to reject this merchant? Please provide a reason for rejection."}
          </AlertDialogDescription>
          
          {/* Rejection Reason Input (only shown when rejecting) */}
          {actionMerchant?.action === "reject" && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Input
                id="rejectionReason"
                placeholder="Please explain why this merchant is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={submitting}
                className="w-full"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmAction()
              }}
              disabled={submitting}
              className={
                actionMerchant?.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {submitting ? "Processing..." : actionMerchant?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}