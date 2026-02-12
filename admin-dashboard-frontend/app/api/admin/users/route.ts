export async function GET() {
  try {
    // In production, these would be real database queries
    const users = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        role: "merchant",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+0987654321",
        role: "user",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Admin User",
        email: "admin@example.com",
        phone: "+1122334455",
        role: "admin",
        created_at: new Date().toISOString(),
      },
    ]

    return Response.json({ users })
  } catch (error) {
    console.error("[v0] Users API error:", error)
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
