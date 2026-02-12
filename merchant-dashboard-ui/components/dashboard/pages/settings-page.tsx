"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle } from "lucide-react"

export function SettingsPage() {
  const params = useParams()
  const sellerId = params.seller_id as string

  const [shopName, setShopName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (sellerId) {
      fetchSellerInfo()
    }
  }, [sellerId])

  const fetchSellerInfo = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Fetching seller info for:", sellerId)
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/seller-info/${sellerId}`
      )

      const data = await response.json()
      console.log("Seller info response:", data)

      if (response.ok && data.msg === "Seller info fetched successfully") {
        setShopName(data.data.shopName || "")
        setBusinessEmail(data.data.businessEmail || "")
        setContactNumber(data.data.contactNumber || "")
      } else {
        setError(data.msg || "Failed to fetch seller information")
      }
    } catch (err) {
      console.error("Error fetching seller info:", err)
      setError("Failed to load seller information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      console.log("Updating seller info for:", sellerId)
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/update-seller/${sellerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopName,
            businessEmail,
            contactNumber,
          }),
        }
      )

      const data = await response.json()
      console.log("Update response:", data)

      if (response.ok && data.msg === "Seller updated successfully") {
        setSuccessMessage("Settings updated successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setError(data.msg || "Failed to update settings")
      }
    } catch (err) {
      console.error("Error updating seller info:", err)
      setError("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
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
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <form onSubmit={handleSaveChanges} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Shop Name</label>
                  <Input
                    placeholder="My Store"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Email</label>
                  <Input
                    type="email"
                    placeholder="store@example.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" className="mt-4 gap-2" disabled={isSaving}>
                  {isSaving && <Spinner className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}