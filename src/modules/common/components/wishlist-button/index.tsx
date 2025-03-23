"use client"

import { useState, useEffect } from "react"
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@lib/data/neon-wishlist"
import Spinner from "@modules/common/icons/spinner"

type WishlistButtonProps = {
  productId: string
  productName: string
  price: number
  thumbnail?: string
  className?: string
}

export default function WishlistButton({
  productId,
  productName,
  price,
  thumbnail,
  className = "",
}: WishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const status = await isInWishlist(productId)
      setIsWishlisted(status)
    }
    checkWishlistStatus()
  }, [productId])

  const handleToggleWishlist = async () => {
    setIsLoading(true)
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId)
        setIsWishlisted(false)
      } else {
        await addToWishlist({
          productId,
          productName,
          price,
          thumbnail,
        })
        setIsWishlisted(true)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`relative group ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <svg
          className={`w-6 h-6 transition-colors ${
            isWishlisted
              ? "text-red-500"
              : "text-gray-400 group-hover:text-gray-600"
          }`}
          fill={isWishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  )
}
