"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Package, ShoppingBag, Settings, Key, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const sellerId = params.seller_id as string

  const [shopName, setShopName] = useState("Merchant")
  const [isLoadingShopName, setIsLoadingShopName] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    if (sellerId) {
      fetchShopName()
    }
  }, [sellerId])

  const fetchShopName = async () => {
    setIsLoadingShopName(true)
    try {
      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/seller-info/${sellerId}`
      )
      const data = await response.json()

      if (response.ok && data.msg === "Seller info fetched successfully") {
        setShopName(data.data.shopName || "Merchant")
      }
    } catch (err) {
      console.error("Error fetching shop name:", err)
      setShopName("Merchant")
    } finally {
      setIsLoadingShopName(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setIsUpdatingPassword(true)

    try {
      const response = await fetch("https://dmarketplacebackend.vercel.app/merchant/Merchat_update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: Number(sellerId),
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPasswordSuccess("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess("")
        }, 2000)
      } else {
        setPasswordError(data.message || "Failed to update password")
      }
    } catch (err) {
      console.error("Password update error:", err)
      setPasswordError("An error occurred while updating password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const navItems = [
    {
      name: "Dashboard",
      href: `/${sellerId}`,
      icon: Package,
    },
    {
      name: "Products",
      href: `/${sellerId}/products`,
      icon: Package,
    },
    {
      name: "Orders",
      href: `/${sellerId}/orders`,
      icon: ShoppingBag,
    },
    {
      name: "Settings",
      href: `/${sellerId}/settings`,
      icon: Settings,
    },
    {
      name: "Printful",
      href: `/${sellerId}/printful`,
      icon: Package,
    },
  ]

  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError("")
                  setPasswordSuccess("")
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-border bg-sidebar transition-all duration-200 ease-out lg:relative lg:w-64",
          sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-64",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-sidebar-border px-6 py-6">
            <div className="flex h-8 w-fit px-2 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              {isLoadingShopName ? "DMarketPlace" : shopName.charAt(0).toUpperCase()}
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground truncate">
              {isLoadingShopName ? (
                <span className="inline-block h-5 w-24 bg-sidebar-accent animate-pulse rounded"></span>
              ) : (
                shopName
              )}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Change Password Button */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full"
            >
              <Key className="h-5 w-5" />
              <span>Change Password</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/60">
            <p>© 2025 Merchant Dashboard</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}