"use client"

import { Heading, Table, Text } from "@medusajs/ui"
import { formatPrice } from "@lib/util/format-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addToNeonCart } from "@lib/data/neon-cart"
import { removeFromWishlist } from "@lib/data/neon-wishlist"
import { useState } from "react"
import Spinner from "@modules/common/icons/spinner"

type WishlistTemplateProps = {
  wishlist: {
    items: Array<{
      product_id: string
      product_name: string
      price: number
      thumbnail?: string
      added_at: string
    }>
  }
}

export default function WishlistTemplate({ wishlist }: WishlistTemplateProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  )
  const [error, setError] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleRemove = async (productId: string) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: true }))
    try {
      await removeFromWishlist(productId)
      setShowMessage({
        type: "success",
        message: "Item removed from wishlist",
      })
      setTimeout(() => setShowMessage(null), 3000)
      window.location.reload()
    } catch (err) {
      console.error("Error removing from wishlist:", err)
      setShowMessage({
        type: "error",
        message: "Failed to remove item from wishlist",
      })
      setTimeout(() => setShowMessage(null), 3000)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleAddToCart = async (
    item: WishlistTemplateProps["wishlist"]["items"][0]
  ) => {
    setLoadingStates((prev) => ({ ...prev, [item.product_id]: true }))
    setError(null)
    try {
      await addToNeonCart({
        productId: item.product_id,
        quantity: 1,
        productName: item.product_name,
        price: item.price,
        stockQuantity: 999, // We'll need to implement proper stock management
      })
      await handleRemove(item.product_id)
      setShowMessage({
        type: "success",
        message: "Item added to cart",
      })
      setTimeout(() => setShowMessage(null), 3000)
      window.location.href = "/store/cart"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setShowMessage({
        type: "error",
        message: "Failed to add item to cart",
      })
      setTimeout(() => setShowMessage(null), 3000)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [item.product_id]: false }))
    }
  }

  if (!wishlist.items.length) {
    return (
      <div className="bg-white min-h-[640px] flex items-center justify-center">
        <div className="max-w-[500px] flex flex-col items-center gap-y-4 text-center">
          <div className="bg-gray-100 rounded-full p-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <Heading level="h1" className="text-2xl font-bold">
            Your wishlist is empty
          </Heading>
          <Text className="text-gray-600">
            Save items that you like in your wishlist. Review them anytime and
            easily move them to the cart.
          </Text>
          <LocalizedClientLink
            href="/store"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors mt-4"
          >
            Continue Shopping
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="content-container">
        <div className="flex flex-col bg-white p-6 gap-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <Heading className="text-2xl font-bold">My Wishlist</Heading>
              <Text className="text-gray-600 mt-1">
                {wishlist.items.length}{" "}
                {wishlist.items.length === 1 ? "item" : "items"}
              </Text>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-x-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Continue Shopping
            </LocalizedClientLink>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
          )}

          {showMessage && (
            <div
              className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
                showMessage.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {showMessage.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <div
                key={item.product_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-x-4">
                  <LocalizedClientLink
                    href={`/store/products/${item.product_id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </div>
                  </LocalizedClientLink>

                  <div className="flex-1 min-w-0">
                    <LocalizedClientLink
                      href={`/store/products/${item.product_id}`}
                      className="block"
                    >
                      <Text className="font-medium truncate hover:text-gray-900">
                        {item.product_name}
                      </Text>
                    </LocalizedClientLink>
                    <Text className="text-gray-500 text-sm mt-1">
                      Added on {new Date(item.added_at).toLocaleDateString()}
                    </Text>
                    <Text className="font-medium mt-2">
                      ${formatPrice(item.price.toString()).value}
                    </Text>
                  </div>
                </div>

                <div className="flex gap-x-2 mt-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={loadingStates[item.product_id]}
                    className="flex-1 h-10 bg-black text-white rounded-md hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-x-2"
                  >
                    {loadingStates[item.product_id] ? (
                      <Spinner />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    disabled={loadingStates[item.product_id]}
                    className="h-10 w-10 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Remove from wishlist"
                  >
                    {loadingStates[item.product_id] ? (
                      <Spinner />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
