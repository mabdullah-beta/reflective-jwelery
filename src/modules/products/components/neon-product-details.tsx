"use client"

import { Heading, Text } from "@medusajs/ui"
import { formatPrice, formatOldPrice } from "@lib/util/format-price"
import { addToNeonCart } from "@lib/data/neon-cart"
import { NeonProduct } from "@lib/data/neon-products"
import { useState, useEffect } from "react"
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@lib/data/neon-wishlist"

type ProductDetailsProps = {
  product: NeonProduct
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  if (!product) return null

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isInWishlistState, setIsInWishlistState] = useState(false)
  const [showWishlistMessage, setShowWishlistMessage] = useState(false)

  useEffect(() => {
    const checkWishlist = async () => {
      const inWishlist = await isInWishlist(product.product_id.toString())
      setIsInWishlistState(inWishlist)
    }
    checkWishlist()
  }, [product.product_id])

  const formattedPrice = formatPrice(product.price)
  const formattedOldPrice = formatOldPrice(product.old_price)

  const handleAddToCart = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await addToNeonCart({
        productId: product.product_id.toString(),
        quantity: 1,
        productName: product.product_name,
        price: Number(product.price),
        stockQuantity: product.stock_quantity || 0,
      })
      window.location.href = "/store/cart"
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlistToggle = async () => {
    setIsWishlistLoading(true)
    try {
      if (isInWishlistState) {
        await removeFromWishlist(product.product_id.toString())
        setIsInWishlistState(false)
        setShowWishlistMessage(true)
        setTimeout(() => setShowWishlistMessage(false), 3000)
      } else {
        await addToWishlist({
          productId: product.product_id.toString(),
          productName: product.product_name,
          price: Number(product.price),
        })
        setIsInWishlistState(true)
        setShowWishlistMessage(true)
        setTimeout(() => setShowWishlistMessage(false), 3000)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsWishlistLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <Heading level="h1" className="text-3xl font-bold mb-2">
          {product.product_name}
        </Heading>
        {product.brand && (
          <Text className="text-ui-fg-subtle mb-2">Brand: {product.brand}</Text>
        )}
      </div>

      <div>
        {formattedPrice.display === "Call for Pricing" ? (
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Call for Pricing
          </button>
        ) : (
          <Text className="text-xl-semi">${formattedPrice.value}</Text>
        )}
        {formattedOldPrice && (
          <Text className="text-ui-fg-muted line-through">
            ${formattedOldPrice}
          </Text>
        )}
      </div>

      {product.full_description && (
        <Text className="text-ui-fg-subtle whitespace-pre-line">
          {product.full_description}
        </Text>
      )}

      <div className="flex flex-col gap-y-4">
        {product.stock_quantity !== null && (
          <div>
            <Text className="font-semibold">Stock Quantity</Text>
            <Text>{product.stock_quantity}</Text>
          </div>
        )}
        {product.weight && (
          <div>
            <Text className="font-semibold">Weight</Text>
            <Text>{product.weight}g</Text>
          </div>
        )}
        {product.dimension && (
          <div>
            <Text className="font-semibold">Dimensions</Text>
            <Text>{product.dimension}</Text>
          </div>
        )}
        {product.size && (
          <div>
            <Text className="font-semibold">Size</Text>
            <Text>
              {product.size} {product.size_unit || ""}
            </Text>
          </div>
        )}
        {product.sku_number && (
          <div>
            <Text className="font-semibold">SKU</Text>
            <Text>{product.sku_number}</Text>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {product.free_shipping === 1 && (
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
            Free Shipping
          </span>
        )}
        {product.for_gender && (
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
            {product.for_gender === "FM" || product.for_gender === "MF"
              ? "Male and Female"
              : product.for_gender === "M"
              ? "Male"
              : product.for_gender === "F"
              ? "Female"
              : product.for_gender}
          </span>
        )}
        {product.top_seller && (
          <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">
            Top Seller
          </span>
        )}
        {product.rij_favorite && (
          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded">
            Staff Pick
          </span>
        )}
        {product.tags?.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {product.options && product.options.length > 0 && (
        <div className="mt-6">
          <Text className="font-semibold text-lg mb-4">Product Options</Text>
          <div className="space-y-6">
            {product.options.map((option) => (
              <div key={option.option_id} className="border rounded-lg p-4">
                <Text className="font-semibold mb-2">
                  {option.display_name}
                </Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {option.values.map((value) => (
                    <div
                      key={value.option_value_id}
                      className="border rounded p-3"
                    >
                      <Text className="font-medium">{value.display_name}</Text>
                      {value.price_adjustment !== "0" && (
                        <Text className="text-sm text-gray-600">
                          {value.price_adjustment_type === "percentage"
                            ? `${value.price_adjustment}%`
                            : `$${value.price_adjustment}`}
                          {value.price_adjustment_type === "percentage"
                            ? " adjustment"
                            : " additional"}
                        </Text>
                      )}
                      {value.apply_sale && (
                        <Text className="text-sm text-green-600">
                          Sale eligible
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-y-4">
        {error && <Text className="text-red-500 text-sm">{error}</Text>}
        {showWishlistMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg z-50">
            {isInWishlistState ? "Added to wishlist" : "Removed from wishlist"}
          </div>
        )}
        <div className="flex gap-x-2">
          <button
            className="flex-1 h-12 bg-black text-white rounded-md hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={product.stock_quantity === 0 || isLoading}
            onClick={handleAddToCart}
          >
            {isLoading
              ? "Adding..."
              : product.stock_quantity === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`flex items-center justify-center gap-x-2 w-40 h-12 rounded-md border transition-colors ${
              isInWishlistState
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            aria-label={
              isInWishlistState ? "Remove from Wishlist" : "Add to Wishlist"
            }
          >
            {isWishlistLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill={isInWishlistState ? "currentColor" : "none"}
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
            )}
            <span className="text-sm font-medium">
              {isInWishlistState ? "Wishlisted" : "Add to Wishlist"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
