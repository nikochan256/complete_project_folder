"use client"

import { PrintfulIntegrationPage } from "@/components/dashboard/pages/printful-integration-page"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrintfulPage() {
  const params = useParams()
  const router = useRouter()
  const sellerId = params.seller_id as string



  



  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <PrintfulIntegrationPage sellerId={sellerId} />
    </div>
  )
}

