// components/admin/merchant-detail-modal.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge, type VerificationStatus } from "@/components/admin/status-badge"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"

interface MerchantDetail {
  id: string
  shopName: string
  walletAddress: string
  businessEmail: string
  contactNumber: string
  businessAddress: string
  logoImg?: string
  description?: string
  kybDocuments?: string
  kybStatus: string
  isApproved: boolean
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface MerchantDetailModalProps {
  merchantId: string
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function MerchantDetailModal({ merchantId, isOpen, onClose, onUpdate }: MerchantDetailModalProps) {
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && merchantId) {
      fetchMerchantDetails()
    }
  }, [isOpen, merchantId])

  const fetchMerchantDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/merchant/${merchantId}`)

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      setMerchant(data.merchant)
    } catch (err) {
      console.error("Failed to fetch merchant details:", err)
      toast({
        title: "Error",
        description: "Failed to load merchant details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (action: "approve" | "reject") => {
    if (!merchant) return

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

      const res = await fetch(`${API_URL}/merchant/${merchantId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.msg || "Failed to update")
      }

      const data = await res.json()

      toast({
        title: "Success",
        description: data.msg || `Merchant ${action === "approve" ? "approved" : "rejected"} successfully`,
      })

      // Reset states
      setActionType(null)
      setRejectionReason("")
      
      onUpdate?.()
      onClose()
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

  const handleViewKYBDocument = () => {
    if (merchant?.kybDocuments) {
      window.open(merchant.kybDocuments, '_blank')
    }
  }

  const getVerificationStatus = (kybStatus: string): VerificationStatus => {
    switch (kybStatus) {
      case "APPROVED":
        return "approved"
      case "REJECTED":
        return "rejected"
      case "UNDER_REVIEW":
        return "pending"
      default:
        return "pending"
    }
  }

  const handleOpenActionDialog = (action: "approve" | "reject") => {
    setActionType(action)
  }

  const handleCloseActionDialog = () => {
    setActionType(null)
    setRejectionReason("")
  }

  const handleConfirmAction = async () => {
    if (!actionType) return
    await handleStatusUpdate(actionType)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : merchant ? (
            <div className="space-y-6">
              {/* Header with Logo and Basic Info */}
              <div className="flex items-start gap-4 pb-4 border-b">
                {merchant.logoImg && (
                  <img
                    src={merchant.logoImg}
                    alt={merchant.shopName}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{merchant.shopName}</h3>
                    <StatusBadge status={getVerificationStatus(merchant.kybStatus)} />
                  </div>
                  {merchant.description && (
                    <p className="text-sm text-muted-foreground">{merchant.description}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Business Email</h4>
                  <p className="text-sm">{merchant.businessEmail}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Contact Number</h4>
                  <p className="text-sm">{merchant.contactNumber || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Business Address</h4>
                  <p className="text-sm">{merchant.businessAddress || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Wallet Address</h4>
                  <p className="text-sm font-mono text-xs break-all">{merchant.walletAddress}</p>
                </div>
              </div>

              {/* Status Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">KYB Status</h4>
                  <Badge variant={merchant.kybStatus === "APPROVED" ? "default" : merchant.kybStatus === "REJECTED" ? "destructive" : "secondary"}>
                    {merchant.kybStatus}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Approval Status</h4>
                  <Badge variant={merchant.isApproved ? "default" : "secondary"}>
                    {merchant.isApproved ? "Approved" : "Not Approved"}
                  </Badge>
                </div>
                {merchant.approvedAt && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Approved On</h4>
                    <p className="text-sm">{new Date(merchant.approvedAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Applied On</h4>
                  <p className="text-sm">{new Date(merchant.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Last Updated</h4>
                  <p className="text-sm">{new Date(merchant.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              {merchant.rejectionReason && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Rejection Reason</h4>
                  <p className="text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                    {merchant.rejectionReason}
                  </p>
                </div>
              )}

              {/* KYB Documents */}
              {merchant.kybDocuments && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">KYB Documents</h4>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 underline"
                    onClick={handleViewKYBDocument}
                  >
                    View Documents
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              {merchant.kybStatus === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenActionDialog("approve")}
                    disabled={submitting}
                  >
                    Approve Merchant
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleOpenActionDialog("reject")}
                    disabled={submitting}
                  >
                    Reject Merchant
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Merchant not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionType !== null} onOpenChange={handleCloseActionDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {actionType === "approve" ? "Approve Merchant" : "Reject Merchant"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === "approve"
              ? "Are you sure you want to approve this merchant? They will be notified via email."
              : "Are you sure you want to reject this merchant? Please provide a reason for rejection."}
          </AlertDialogDescription>
          
          {/* Rejection Reason Input (only shown when rejecting) */}
          {actionType === "reject" && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="rejectionReasonModal">Rejection Reason *</Label>
              <Input
                id="rejectionReasonModal"
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
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {submitting ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}