"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { AddProductModal } from "@/components/dashboard/modals/add-product-modal"
import { EditProductModal } from "@/components/dashboard/modals/edit-product-modal"

export function ProductsPage(){
  const params = useParams()
  const sellerId = params.seller_id as string
  const [products, setProducts] = useState<any[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`https://dmarketplacebackend.vercel.app/merchant/products/${sellerId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        if (data.success && data.products) {
          setProducts(data.products)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products. Please try again.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (sellerId) {
      fetchProducts()
    }
  }, [sellerId])

  const handleAddProduct = async (formDataToSend: FormData) => {
    try {
      formDataToSend.append("sellerId", sellerId)

      const response = await fetch("https://dmarketplacebackend.vercel.app/merchant/create-product", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || "Failed to create product")
      }

      const data = await response.json()

      if (data.data) {
        setProducts([data.data, ...products])
        setIsAddModalOpen(false)
        alert("Product created successfully!")
      }
    } catch (err: any) {
      console.error("Error creating product:", err)
      alert(err.message || "Failed to create product. Please try again.")
    }
  }

  const handleEditProduct = async (productId: number, formDataToSend: FormData) => {
    try {
      formDataToSend.append("sellerId", sellerId)

      const response = await fetch(`https://dmarketplacebackend.vercel.app/merchant/update-product/${productId}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || "Failed to update product")
      }

      const data = await response.json()

      if (data.data) {
        setProducts(products.map((p) => (p.id === productId ? data.data : p)))
        setIsEditModalOpen(false)
        setEditingProduct(null)
        alert("Product updated successfully!")
      }
    } catch (err: any) {
      console.error("Error updating product:", err)
      alert(err.message || "Failed to update product. Please try again.")
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`https://dmarketplacebackend.vercel.app/merchant/delete-product/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sellerId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || "Failed to delete product")
      }

      setProducts(products.filter((p) => p.id !== productId))
      alert("Product deleted successfully!")
    } catch (err: any) {
      console.error("Error deleting product:", err)
      alert(err.message || "Failed to delete product. Please try again.")
    }
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="mt-2 text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsAddModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <Card className="border-border">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found. Create your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Image</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <img
                          src={product.image1 || "/placeholder.svg?height=40&width=40&query=product"}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                      <td className="py-3 px-4 text-foreground">{product.category}</td>
                      <td className="py-3 px-4 text-foreground">${product.price}</td>
                      <td className="py-3 px-4 text-foreground">{product.quantity}</td>
                      <td className="py-3 px-4">
                        <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-foreground">{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleEditProduct}
        product={editingProduct}
      />
    </div>
  )
}