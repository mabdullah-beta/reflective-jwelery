import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get the cookie store
    const cookieStore = await cookies()
    const customerId = cookieStore.get("customer_id")?.value

    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM customer 
      WHERE customer_id = ${parseInt(customerId)} 
      AND active = 1
    `

    const customer = result.rows[0]

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Get current customer error:", error)
    return NextResponse.json(
      { error: "Failed to get customer" },
      { status: 500 }
    )
  }
}
