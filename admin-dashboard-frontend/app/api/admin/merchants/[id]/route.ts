export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // In production, this would be a real database query
    const merchant = {
      id,
      name: "Tech Store",
      category: "Electronics",
      description: "A leading electronics retailer specializing in computers and gadgets.",
      city: "New York",
      state: "NY",
      phone: "+1234567890",
      profile_image: "/tech-store-logo.jpg",
      verification_status: "pending",
      verification_fee_paid: true,
      created_at: new Date().toISOString(),
    }

    return Response.json({ merchant })
  } catch (error) {
    console.error("[v0] Merchant detail API error:", error)
    return Response.json({ error: "Failed to fetch merchant details" }, { status: 500 })
  }
}
