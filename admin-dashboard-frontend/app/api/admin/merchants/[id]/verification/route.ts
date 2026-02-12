export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log("[v0] Updating merchant", id, "with status:", body.verification_status)

    // In production, this would update the database
    // For now, just return success
    return Response.json({
      success: true,
      message: `Merchant ${id} verification status updated to ${body.verification_status}`,
    })
  } catch (error) {
    console.error("[v0] Verification update error:", error)
    return Response.json({ error: "Failed to update verification status" }, { status: 500 })
  }
}
