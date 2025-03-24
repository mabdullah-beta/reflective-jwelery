import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { SignUpCredentials } from "../../../../types/account"

export async function POST(request: Request) {
  try {
    const credentials: SignUpCredentials = await request.json()

    // Check if email already exists
    const existingUser = await sql`
      SELECT email FROM customer 
      WHERE email = ${credentials.email}
    `

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Get the next user_id from the sequence
    const nextUserIdResult = await sql`
      SELECT COALESCE(MAX(user_id), 0) + 1 as next_user_id 
      FROM customer
    `
    const nextUserId = nextUserIdResult.rows[0].next_user_id

    // Insert the new customer with user_id
    const result = await sql`
      INSERT INTO customer (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        cellphone,
        legal_name,
        active,
        registration_date
      ) VALUES (
        ${nextUserId},
        ${credentials.first_name},
        ${credentials.last_name},
        ${credentials.email},
        ${credentials.phone || null},
        ${credentials.cellphone || null},
        ${credentials.legal_name || null},
        1,
        NOW()
      )
      RETURNING *
    `

    const customer = result.rows[0]

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
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
