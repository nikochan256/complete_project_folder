"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, X } from "lucide-react"

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productId: number, formData: FormData) => void
  product: any | null
}

export function EditProductModal({ isOpen, onClose, onSubmit, product }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "0",
    category: "",
    images: [] as File[],
  })
  const [existingImages, setExistingImages] = useState<(string | null)[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load product data when modal opens
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "0",
        category: product.category || "",
        images: [],
      })
      
      // Load existing images
      const existing = [product.image1, product.image2, product.image3].filter(Boolean)
      setExistingImages(existing)
      setImagePreviews([])
      setImagesToDelete([])
      setErrors({})
    }
  }, [product, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const totalImages = existingImages.length - imagesToDelete.length + formData.images.length + files.length
    
    if (totalImages > 3) {
      setErrors((prev) => ({ ...prev, images: "Maximum 3 images allowed" }))
      return
    }

    const newImages = [...formData.images, ...files]
    setFormData((prev) => ({ ...prev, images: newImages }))

    setErrors((prev) => {
      const { images, ...rest } = prev
      return rest
    })

    const newPreviews = [...imagePreviews]
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        setImagePreviews([...newPreviews])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setImagesToDelete((prev) => [...prev, index])
  }

  const restoreExistingImage = (index: number) => {
    setImagesToDelete((prev) => prev.filter((i) => i !== index))
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", quantity: "0", category: "", images: [] })
    setExistingImages([])
    setImagePreviews([])
    setImagesToDelete([])
    setErrors({})
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required"
    if (!formData.quantity || Number.parseInt(formData.quantity) < 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    
    const remainingExisting = existingImages.length - imagesToDelete.length
    const totalImages = remainingExisting + formData.images.length
    
    if (totalImages === 0) newErrors.images = "At least one product image is required"
    if (totalImages > 3) newErrors.images = "Maximum 3 images allowed"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !product) return

    try {
      setIsSubmitting(true)

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("price", Math.round(Number.parseFloat(formData.price)).toString())
      formDataToSend.append("quantity", formData.quantity)
      formDataToSend.append("category", formData.category)
      
      // Append new images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      // Mark images for deletion
      if (imagesToDelete.includes(1)) formDataToSend.append("deleteImage2", "true")
      if (imagesToDelete.includes(2)) formDataToSend.append("deleteImage3", "true")

      await onSubmit(product.id, formDataToSend)

      resetForm()
    } catch (err) {
      console.error("Error submitting form:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeExistingImages = existingImages.filter((_, idx) => !imagesToDelete.includes(idx))

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Product Name *
            </label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description *
            </label>
            <textarea
              id="description"
              placeholder="Describe your product in detail"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-24 ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-foreground">
              Price ($) *
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="29.99"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              className={errors.price ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium text-foreground">
              Quantity *
            </label>
            <Input
              id="quantity"
              type="number"
              min="0"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              disabled={isSubmitting}
            />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              disabled={isSubmitting}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${errors.category ? "border-destructive" : ""}`}
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Gaming">Gaming</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Books & Media">Books & Media</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Toys & Kids">Toys & Kids</option>
              <option value="Automotive">Automotive</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* Image Management */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Product Images * (Max 3)
            </label>
            <p className="text-xs text-muted-foreground">
              {activeExistingImages.length + formData.images.length}/3 images
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Current Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Existing ${index + 1}`}
                        className={`h-24 w-full object-cover rounded border ${
                          imagesToDelete.includes(index) ? "opacity-50 border-destructive" : "border-border"
                        }`}
                      />
                      {imagesToDelete.includes(index) ? (
                        <button
                          type="button"
                          onClick={() => restoreExistingImage(index)}
                          className="absolute inset-0 bg-black/60 text-white text-xs flex items-center justify-center"
                          disabled={isSubmitting}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {index === 0 ? "Main" : `${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">New Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`New ${index + 1}`}
                        className="h-24 w-full object-cover rounded border border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {activeExistingImages.length + formData.images.length < 3 && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label htmlFor="images" className="cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Click to upload more images</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB ({3 - activeExistingImages.length - formData.images.length} remaining)
                    </p>
                  </div>
                </label>
              </div>
            )}

            {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}