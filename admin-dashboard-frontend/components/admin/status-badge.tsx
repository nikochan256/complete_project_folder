import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type VerificationStatus = "pending" | "approved" | "rejected"

interface StatusBadgeProps {
  status: VerificationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<VerificationStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    approved: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border border-red-200" },
  }

  const config = statusConfig[status]

  return <Badge className={cn("font-medium", config.className)}>{config.label}</Badge>
}
