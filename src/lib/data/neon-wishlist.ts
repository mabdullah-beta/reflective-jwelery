"use server"

import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

const WISHLIST_COOKIE_NAME = "neon_wishlist"

interface WishlistItem {
  product_id: string
  product_name: string
  price: number
  thumbnail?: string
  added_at: string
  images?: Array<{
    filename: string
    file_path: string
    media_caption?: string
  }>
}

interface Wishlist {
  items: WishlistItem[]
}

export async function getWishlist(): Promise<Wishlist> {
  const cookieStore = await cookies()
  const wishlistCookie = cookieStore.get(WISHLIST_COOKIE_NAME)

  if (!wishlistCookie) {
    return { items: [] }
  }

  try {
    return JSON.parse(wishlistCookie.value)
  } catch (error) {
    console.error("Error parsing wishlist cookie:", error)
    return { items: [] }
  }
}

export async function addToWishlist({
  productId,
  productName,
  price,
  thumbnail,
  images,
}: {
  productId: string
  productName: string
  price: number
  thumbnail?: string
  images?: Array<{
    filename: string
    file_path: string
    media_caption?: string
  }>
}) {
  const wishlist = await getWishlist()

  // Check if product already exists in wishlist
  const existingItemIndex = wishlist.items.findIndex(
    (item) => item.product_id === productId
  )

  if (existingItemIndex === -1) {
    // Add new item if product doesn't exist
    wishlist.items.push({
      product_id: productId,
      product_name: productName,
      price,
      thumbnail,
      images,
      added_at: new Date().toISOString(),
    })

    // Save wishlist to cookie
    const cookieStore = await cookies()
    cookieStore.set(WISHLIST_COOKIE_NAME, JSON.stringify(wishlist), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    revalidateTag("wishlist")
  }

  return wishlist
}

export async function removeFromWishlist(productId: string) {
  const wishlist = await getWishlist()
  wishlist.items = wishlist.items.filter(
    (item) => item.product_id !== productId
  )

  // Save wishlist to cookie
  const cookieStore = await cookies()
  cookieStore.set(WISHLIST_COOKIE_NAME, JSON.stringify(wishlist), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  revalidateTag("wishlist")
  return wishlist
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const wishlist = await getWishlist()
  return wishlist.items.some((item) => item.product_id === productId)
}

export async function clearWishlist() {
  const cookieStore = await cookies()
  cookieStore.delete(WISHLIST_COOKIE_NAME)
  revalidateTag("wishlist")
  return { items: [] }
}
