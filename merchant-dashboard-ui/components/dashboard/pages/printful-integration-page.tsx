"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, CheckCircle, LinkIcon, LogOut, Eye, EyeOff } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

type Step = "api_key" | "verification" | "store_selection" | "connected"
type ConnectionStatus = "disconnected" | "verifying" | "connected" | "error"

interface Store {
  id: number
  name: string
  type: string
}

interface PrintfulProduct {
  id: number
  external_id: string
  name: string
  variants: number
  synced: number
  thumbnail_url: string
  is_ignored: boolean
}

export function PrintfulIntegrationPage({ sellerId }: { sellerId: string }) {
  const [step, setStep] = useState<Step>("api_key")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [selectedStoreName, setSelectedStoreName] = useState("")
  const [connectedStoreId, setConnectedStoreId] = useState<number | null>(null)
  const [connectedStoreName, setConnectedStoreName] = useState("")
  const [savedApiKey, setSavedApiKey] = useState("")
  const [storeId, setStoreId] = useState<number | null>(null)
  const [printfulProducts, setPrintfulProducts] = useState<PrintfulProduct[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [importingProductId, setImportingProductId] = useState<number | null>(null)

  const handleVerifyApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey.trim()) {
      setError("API key is required")
      return
    }

    setIsLoading(true)
    setConnectionStatus("verifying")

    try {
      const response = await fetch("https://dmarketplacebackend.vercel.app/merchant/verify-printful-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      })

      const data = await response.json()

      if (data.success && data.result) {
        setStores(data.result)
        setSavedApiKey(apiKey.trim())

        if (data.storeId) {
          setStoreId(data.storeId)
        }

        if (data.result.length === 1) {
          const store = data.result[0]
          setSelectedStoreId(store.id)
          setSelectedStoreName(store.name)
          setConnectedStoreId(store.id)
          setConnectedStoreName(store.name)

          if (data.storeId) {
            setStoreId(data.storeId)
          }

          setConnectionStatus("connected")
          setStep("connected")
        } else {
          setStep("store_selection")
        }
      } else {
        setError(data.message || "Failed to verify API key")
        setConnectionStatus("error")
      }
    } catch (err) {
      setError("Failed to connect to Printful. Please check your API key.")
      setConnectionStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectStore = async () => {
    if (!selectedStoreId) return

    setIsLoading(true)
    try {
      setConnectedStoreId(selectedStoreId)
      setConnectedStoreName(selectedStoreName)
      setStoreId(selectedStoreId)
      setConnectionStatus("connected")
      setStep("connected")
    } catch (err) {
      setError("Failed to connect store")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncProducts = async () => {
    if (!connectedStoreId || !savedApiKey) {
      setError("Store ID or API key is missing. Please reconnect.")
      return
    }

    setIsSyncing(true)
    setError("")

    try {
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/store-products/${connectedStoreId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: savedApiKey,
          }),
        },
      )

      const data = await response.json()
      console.log("[v0] Backend response:", data)

      if (data.msg === "Products fetched successfully" && data.data?.result) {
        setPrintfulProducts(data.data.result)
      } else {
        setError(data.msg || "Failed to fetch products from Printful")
      }
    } catch (err) {
      console.log("[v0] Error syncing products:", err)
      setError("Failed to sync products. Check your connection.")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = () => {
    setStep("api_key")
    setConnectionStatus("disconnected")
    setApiKey("")
    setShowApiKey(false)
    setStores([])
    setSelectedStoreId(null)
    setSelectedStoreName("")
    setConnectedStoreId(null)
    setConnectedStoreName("")
    setSavedApiKey("")
    setStoreId(null)
    setPrintfulProducts([])
    setError("")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Printful Integration</h1>
        <p className="mt-2 text-muted-foreground">Connect your Printful account to sync print-on-demand products</p>
      </div>

      {/* Disconnected State - API Key Input */}
      {step === "api_key" && (
        <Card className="max-w-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Connect Your Printful Account
            </CardTitle>
            <CardDescription>Enter your Printful API key to sync your print-on-demand products</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyApiKey} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium text-foreground">
                  Printful API Key *
                </label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setError("")
                    }}
                    className={error ? "border-destructive pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && <p className="text-xs text-destructive flex items-center gap-1">{error}</p>}
                <p className="text-xs text-muted-foreground">
                  <a
                    href="https://www.printful.com/faq#where-can-i-find-my-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Where to find my Printful API key?
                  </a>
                </p>
              </div>

              <Button type="submit" disabled={isLoading || !apiKey.trim()} className="w-full">
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                {isLoading ? "Verifying..." : "Verify & Connect"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Store Selection */}
      {step === "store_selection" && (
        <Card className="max-w-2xl border-border">
          <CardHeader>
            <CardTitle>Select Your Printful Store</CardTitle>
            <CardDescription>You have multiple Printful stores. Select which one to connect:</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedStoreId?.toString() || ""}
              onValueChange={(val) => {
                const storeId = Number.parseInt(val)
                const store = stores.find((s) => s.id === storeId)
                if (store) {
                  setSelectedStoreId(storeId)
                  setSelectedStoreName(store.name)
                }
              }}
            >
              <div className="space-y-3">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={store.id.toString()} id={`store-${store.id}`} />
                    <label htmlFor={`store-${store.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-foreground">{store.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {store.id}</div>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("api_key")
                  setError("")
                }}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button onClick={handleSelectStore} disabled={!selectedStoreId || isLoading} className="flex-1">
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                {isLoading ? "Connecting..." : "Connect Selected Store"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected State - Product Sync Dashboard */}
      {step === "connected" && connectedStoreId && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <Card className="max-w-2xl border-border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <CardTitle className="text-green-900 dark:text-green-100">Connected to Printful</CardTitle>
                    <CardDescription className="text-green-800 dark:text-green-200">
                      Connected to: {connectedStoreName} (ID: {connectedStoreId})
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Sync Products Card */}
          <Card className="max-w-2xl border-border">
            <CardHeader>
              <CardTitle>Product Synchronization</CardTitle>
              <CardDescription>Fetch and import products from your Printful store</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSyncProducts} disabled={isSyncing} size="lg" className="gap-2">
                {isSyncing && <Spinner className="h-4 w-4" />}
                {isSyncing ? "Syncing Products..." : "Sync Products"}
              </Button>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products List */}
          {printfulProducts.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Available Products ({printfulProducts.length})</CardTitle>
                <CardDescription>Click "Import to Store" to add products to your merchant store</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {printfulProducts.map((product) => (
                    <PrintfulProductCard
                      key={product.id}
                      product={product}
                      apiKey={savedApiKey}
                      sellerId={sellerId}
                      onImporting={() => setImportingProductId(product.id)}
                      onImportComplete={() => setImportingProductId(null)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isSyncing && printfulProducts.length === 0 && (
            <Card className="max-w-2xl border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-muted-foreground">
                  No products synced yet. Click "Sync Products" to fetch your Printful inventory.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function PrintfulProductCard({
  product,
  apiKey,
  sellerId,
  onImporting,
  onImportComplete,
}: {
  product: PrintfulProduct
  apiKey: string
  sellerId: string
  onImporting: () => void
  onImportComplete: () => void
}) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  return (
    <>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.thumbnail_url || "/placeholder.svg?height=300&width=300&query=printful+product"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm mb-2">{product.name}</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Variants</span>
              <span className="font-medium text-foreground">{product.variants}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Synced</span>
              <span className="font-medium text-foreground">
                {product.synced}/{product.variants}
              </span>
            </div>
          </div>
          <Button onClick={() => setIsImportModalOpen(true)} size="sm" variant="outline" className="w-full">
            Import to Store
          </Button>
        </CardContent>
      </Card>

      <PrintfulProductImportModal
        isOpen={isImportModalOpen}
        product={product}
        apiKey={apiKey}
        sellerId={sellerId}
        onClose={() => setIsImportModalOpen(false)}
        onImporting={onImporting}
        onImportComplete={onImportComplete}
      />
    </>
  )
}

function PrintfulProductImportModal({
  isOpen,
  product,
  apiKey,
  sellerId,
  onClose,
  onImporting,
  onImportComplete,
}: {
  isOpen: boolean
  product: PrintfulProduct
  apiKey: string
  sellerId: string
  onClose: () => void
  onImporting: () => void
  onImportComplete: () => void
}) {
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) newErrors.description = "Description is required"
    if (description.trim().length < 50) newErrors.description = "Description must be at least 50 characters"
    if (!price || Number.parseFloat(price) <= 0) newErrors.price = "Valid price is required"
    if (!category.trim()) newErrors.category = "Category is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
  
    setIsSubmitting(true)
    onImporting()
    
    try {
      console.log("calling import from printfull function")
  
      const response = await fetch("https://dmarketplacebackend.vercel.app/merchant/import-printfull-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: product.name,
          description: description,
          price: Math.round(Number.parseFloat(price) * 100).toString(),
          quantity: quantity || "0",
          category: category,
          sellerId: sellerId,
          imageUrl: product.thumbnail_url,
        }),
      })
  
      const data = await response.json()
      console.log("[v0] Import response:", data)
  
      if (response.ok && data.msg === "Product created successfully") {
        setSuccessMessage("Product imported successfully!")
        setTimeout(() => {
          onClose()
          setDescription("")
          setPrice("")
          setQuantity("0")
          setCategory("")
          setSuccessMessage("")
          setErrors({})
        }, 2000)
      } else {
        setErrors({ submit: data.msg || "Failed to import product" })
      }
    } catch (err) {
      console.log("[v0] Error importing product:", err)
      setErrors({ submit: "Error importing product. Please try again." })
    } finally {
      setIsSubmitting(false)
      onImportComplete()
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-border">
        <DialogHeader>
          <DialogTitle>Import Product to Store</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleImport} className="space-y-4 max-h-96 overflow-y-auto pr-4">
          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Name</label>
              <Input value={product.name} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Variants</label>
              <Input value={product.variants} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product Image</label>
            <img
              src={product.thumbnail_url || "/placeholder.svg"}
              alt={product.name}
              className="h-32 w-32 object-cover rounded-lg border border-border"
            />
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description * <span className="text-xs text-destructive ml-2">Required</span>
            </label>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              Printful doesn't provide descriptions. Add a detailed product description.
            </p>
            <textarea
              id="description"
              placeholder="Describe your product in detail (minimum 50 characters)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
              }}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-24 ${
                errors.description ? "border-destructive" : ""
              }`}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">{description.length}/50 characters minimum</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-foreground">
                Price ($) *
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }))
                }}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Category *
            </label>
            <Input
              id="category"
              placeholder="e.g., Clothing, Home Decor"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                if (errors.category) setErrors((prev) => ({ ...prev, category: "" }))
              }}
              className={errors.category ? "border-destructive" : ""}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
            </div>
          )}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? "Adding to Store..." : "Add to My Store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
