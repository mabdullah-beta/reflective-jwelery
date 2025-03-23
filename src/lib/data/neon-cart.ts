"use server"

import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

const CART_COOKIE_NAME = "neon_cart"

interface NeonCartItem {
  product_id: string
  quantity: number
  product_name: string
  price: number
  stock_quantity: number
  thumbnail?: string
}

interface NeonCart {
  items: NeonCartItem[]
  total: number
}

export async function getNeonCart(): Promise<NeonCart> {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(CART_COOKIE_NAME)

  if (!cartCookie) {
    return { items: [], total: 0 }
  }

  try {
    return JSON.parse(cartCookie.value)
  } catch (error) {
    console.error("Error parsing cart cookie:", error)
    return { items: [], total: 0 }
  }
}

export async function addToNeonCart({
  productId,
  quantity,
  productName,
  price,
  stockQuantity,
  thumbnail,
}: {
  productId: string
  quantity: number
  productName: string
  price: number
  stockQuantity: number
  thumbnail?: string
}) {
  const cart = await getNeonCart()

  // Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product_id === productId
  )

  if (existingItemIndex !== -1) {
    // Update quantity if product exists
    const newQuantity = cart.items[existingItemIndex].quantity + quantity

    // Check if new quantity exceeds stock
    if (newQuantity > stockQuantity) {
      throw new Error(`Only ${stockQuantity} items available in stock`)
    }

    cart.items[existingItemIndex].quantity = newQuantity
  } else {
    // Add new item if product doesn't exist
    if (quantity > stockQuantity) {
      throw new Error(`Only ${stockQuantity} items available in stock`)
    }

    cart.items.push({
      product_id: productId,
      quantity,
      product_name: productName,
      price,
      stock_quantity: stockQuantity,
      thumbnail,
    })
  }

  // Calculate total
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Save cart to cookie
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidateTag("cart")
  return cart
}

export async function updateNeonCartItem({
  productId,
  quantity,
}: {
  productId: string
  quantity: number
}) {
  const cart = await getNeonCart()
  const item = cart.items.find((item) => item.product_id === productId)

  if (!item) {
    throw new Error("Item not found in cart")
  }

  if (quantity > item.stock_quantity) {
    throw new Error(`Only ${item.stock_quantity} items available in stock`)
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.product_id !== productId)
  } else {
    item.quantity = quantity
  }

  // Calculate total
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Save cart to cookie
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidateTag("cart")
  return cart
}

export async function removeFromNeonCart(productId: string) {
  const cart = await getNeonCart()
  cart.items = cart.items.filter((item) => item.product_id !== productId)

  // Calculate total
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Save cart to cookie
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidateTag("cart")
  return cart
}

export async function clearNeonCart() {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE_NAME)
  revalidateTag("cart")
  return { items: [], total: 0 }
}
