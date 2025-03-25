import { verifyImages } from "@lib/util/verify-images"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await verifyImages()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error verifying images:", error)
    return NextResponse.json(
      { error: "Failed to verify images" },
      { status: 500 }
    )
  }
}
