export async function GET(request: Request) {
  try {
    // In production, these would be real database queries
    const merchants = [
      {
        id: "1",
        name: "Tech Store",
        category: "Electronics",
        city: "New York",
        phone: "+1234567890",
        verification_status: "pending",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Fashion Hub",
        category: "Clothing",
        city: "Los Angeles",
        phone: "+0987654321",
        verification_status: "approved",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Green Cafe",
        category: "Food & Beverage",
        city: "Boston",
        phone: "+1555666777",
        verification_status: "pending",
        created_at: new Date().toISOString(),
      },
    ]

    // Filter by status if provided
    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    const filtered = status ? merchants.filter((m) => m.verification_status === status) : merchants

    return Response.json({ merchants: filtered })
  } catch (error) {
    console.error("[v0] Merchants API error:", error)
    return Response.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
}
