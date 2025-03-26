"use client"

import { Table, Text } from "@medusajs/ui"
import { updateNeonCartItem, removeFromNeonCart } from "@lib/data/neon-cart"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import NeonDeleteButton from "@modules/common/components/neon-delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import { useState } from "react"
import { formatPrice } from "@lib/util/format-price"
import { formatProductUrl } from "@lib/util/format-product-url"
import Image from "next/image"
import { getImageUrl } from "@lib/util/get-image-url"

// Custom event for cart updates
const CART_UPDATE_EVENT = "neon-cart-update"

type NeonCartItemProps = {
  item: {
    product_id: string
    quantity: number
    product_name: string
    price: number
    stock_quantity: number
    thumbnail?: string
    images?: Array<{
      filename: string
      file_path: string
      media_caption?: string
    }>
  }
}

const NeonCartItem = ({ item }: NeonCartItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCartImageUrl = () => {
    if (!item.images?.length) return item.thumbnail
    return getImageUrl(item.images[0])
  }

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    try {
      await updateNeonCartItem({
        productId: item.product_id,
        quantity,
      })
      // Dispatch custom event
      window.dispatchEvent(new Event(CART_UPDATE_EVENT))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setUpdating(true)

    try {
      await removeFromNeonCart(item.product_id)
      // Dispatch custom event
      window.dispatchEvent(new Event(CART_UPDATE_EVENT))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const formattedPrice = formatPrice(item.price.toString())
  const total = formatPrice((item.price * item.quantity).toString())

  return (
    <Table.Row className="border-b border-gray-200 last:border-b-0">
      <Table.Cell className="!pl-0 py-4 w-[100px]">
        <LocalizedClientLink
          href={`/store/products/${formatProductUrl(item.product_name)}`}
          className="flex w-[80px]"
        >
          <div className="w-[80px] h-[80px] bg-gray-100 rounded-md flex items-center justify-center relative">
            {(() => {
              const imageUrl = getCartImageUrl()
              if (!imageUrl) {
                return <span className="text-gray-400 text-sm">No image</span>
              }
              return (
                <Image
                  src={imageUrl}
                  alt={item.product_name}
                  fill
                  className="object-cover rounded-md"
                  sizes="80px"
                />
              )
            })()}
          </div>
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="py-4">
        <div className="flex flex-col gap-y-2">
          <LocalizedClientLink
            href={`/store/products/${formatProductUrl(item.product_name)}`}
            className="hover:text-gray-900"
          >
            <Text className="font-medium">{item.product_name}</Text>
          </LocalizedClientLink>
          <div className="flex items-center gap-x-2">
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-x-1"
              disabled={updating}
            >
              {updating ? (
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </>
              )}
            </button>
            {error && <ErrorMessage error={error} />}
          </div>
        </div>
      </Table.Cell>

      <Table.Cell className="!pr-8 py-4">
        <div className="flex justify-end">
          <select
            value={item.quantity}
            onChange={(e) => changeQuantity(parseInt(e.target.value))}
            className="w-16 h-9 rounded-md border border-gray-200 text-sm px-2 disabled:bg-gray-100"
            disabled={updating}
          >
            {Array.from(
              { length: Math.min(item.stock_quantity, 10) },
              (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              )
            )}
          </select>
        </div>
      </Table.Cell>

      <Table.Cell className="text-right py-4">
        <Text className="font-medium">${total.value}</Text>
      </Table.Cell>
    </Table.Row>
  )
}

export default NeonCartItem
