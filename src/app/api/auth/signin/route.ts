import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { SignInCredentials } from "../../../../types/account"

export async function POST(request: Request) {
  try {
    const credentials: SignInCredentials = await request.json()

    // Get customer by email
    const result = await sql`
      SELECT * FROM customer 
      WHERE email = ${credentials.email} 
      AND active = 1
    `

    const customer = result.rows[0]

    if (!customer) {
      return NextResponse.json({ error: "Invalid email" }, { status: 401 })
    }

    // Create response with customer data
    const response = NextResponse.json(customer)

    // Set session cookie
    response.cookies.set("customer_id", customer.customer_id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
