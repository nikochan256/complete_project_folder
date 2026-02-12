"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge, type VerificationStatus } from "./status-badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MerchantDetail {
  id: string
  name: string
  category: string
  description: string
  phone: string
  city: string
  state: string
  profile_image: string | null
  verification_status: VerificationStatus
  verification_fee_paid: boolean
  created_at: string
}

interface MerchantDetailDrawerProps {
  merchantId: string
  onClose: () => void
  onUpdate: () => void
}

export function MerchantDetailDrawer({ merchantId, onClose, onUpdate }: MerchantDetailDrawerProps) {
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const res = await fetch(`/api/admin/merchants/${merchantId}`)
        const data = await res.json()
        setMerchant(data.merchant)
      } catch (error) {
        console.error("Failed to fetch merchant:", error)
        toast({
          title: "Error",
          description: "Failed to load merchant details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMerchant()
  }, [merchantId, toast])

  const handleAction = async (action: "approve" | "reject") => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_status: action === "approve" ? "approved" : "rejected",
        }),
      })

      if (!res.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: `Merchant ${action === "approve" ? "approved" : "rejected"} successfully`,
      })
      setConfirmAction(null)
      onUpdate()
    } catch (error) {
      console.error("Failed to update merchant:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} merchant`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto p-0">
          <SheetHeader className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
            <SheetTitle className="text-xl">Merchant Details</SheetTitle>
          </SheetHeader>

          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-32 w-32 rounded-lg" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : merchant ? (
            <div className="p-6 space-y-8">
              {/* Profile Image Section */}
              {merchant.profile_image && (
                <div className="flex justify-center">
                  <img
                    src={merchant.profile_image || "/placeholder.svg"}
                    alt={merchant.name}
                    className="w-40 h-40 rounded-lg object-cover shadow-sm border border-border"
                  />
                </div>
              )}

              {/* Profile Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-5 text-foreground">Profile Information</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Name</p>
                      <p className="text-base font-semibold text-foreground">{merchant.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Category</p>
                      <p className="text-base font-semibold text-foreground">{merchant.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Phone</p>
                      <p className="text-base font-semibold text-foreground">{merchant.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Location</p>
                      <p className="text-base font-semibold text-foreground">
                        {merchant.city}, {merchant.state}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="border-t border-border pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Description</p>
                <p className="text-base text-foreground leading-relaxed">{merchant.description}</p>
              </div>

              {/* Verification Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-5 text-foreground">Verification</h3>
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Status</p>
                      <StatusBadge status={merchant.verification_status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Fee Paid</p>
                      <p className="text-base font-semibold text-foreground">
                        {merchant.verification_fee_paid ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Applied Date
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {new Date(merchant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              {merchant.verification_status === "pending" && (
                <div className="border-t border-border pt-6 flex gap-3">
                  <Button
                    onClick={() => setConfirmAction("approve")}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    {submitting ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    onClick={() => setConfirmAction("reject")}
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    {submitting ? "Processing..." : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Merchant not found</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-lg font-semibold">
            {confirmAction === "approve" ? "Approve Merchant" : "Reject Merchant"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {confirmAction === "approve"
              ? "Are you sure you want to approve this merchant? This action cannot be undone."
              : "Are you sure you want to reject this merchant? This action cannot be undone."}
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && handleAction(confirmAction)}
              disabled={submitting}
              className={
                confirmAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
