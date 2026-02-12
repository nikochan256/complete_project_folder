export async function GET() {
  try {
    // In production, these would be real database queries
    const metrics = {
      totalUsers: 156,
      totalMerchants: 42,
      pendingApprovals: 8,
      approvedMerchants: 34,
    }

    return Response.json({ metrics })
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
    return Response.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}
