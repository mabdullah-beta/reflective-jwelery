"use client"

import { useState, useEffect } from "react"
import { formatPrice } from "@lib/util/format-price"
import { useRouter } from "next/navigation"
import { clearNeonCart } from "@lib/data/neon-cart"
import Image from "next/image"
import { getImageUrl } from "@lib/util/get-image-url"

type CheckoutTemplateProps = {
  cart: {
    items: Array<{
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
    }>
    total: number
  }
}

export default function CheckoutTemplate({ cart }: CheckoutTemplateProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use useEffect to mark when component is mounted on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await clearNeonCart()
      router.push("/store/checkout/success")
    } catch (err) {
      setError(
        "An error occurred while processing your order. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // Only render form content on client side
  if (!isClient) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-2xl font-bold mb-8">Checkout</h1>
              <div className="bg-gray-100 animate-pulse h-[600px] rounded-lg"></div>
            </div>
            <div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="animate-pulse space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="h-20 bg-gray-100 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields remain the same but add suppressHydrationWarning */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {Object.entries({
                    email: { label: "Email", type: "email" },
                    firstName: { label: "First Name", type: "text" },
                    lastName: { label: "Last Name", type: "text" },
                    address: { label: "Address", type: "text" },
                    city: { label: "City", type: "text" },
                    state: { label: "State", type: "text" },
                    zipCode: { label: "ZIP Code", type: "text" },
                    phone: { label: "Phone", type: "tel" },
                    cardNumber: { label: "Card Number", type: "text" },
                    expiryDate: {
                      label: "Expiry Date",
                      type: "text",
                      placeholder: "MM/YY",
                    },
                    cvv: { label: "CVV", type: "text" },
                  }).map(([name, { label, type, placeholder }]) => (
                    <div key={name} className="w-full">
                      <label
                        htmlFor={name}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        suppressHydrationWarning
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              >
                {loading
                  ? "Processing..."
                  : `Pay $${formatPrice(cart.total.toString()).value}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center relative">
                      {(() => {
                        const imageUrl = item.images?.[0]
                          ? getImageUrl(item.images[0])
                          : item.thumbnail
                        if (!imageUrl) {
                          return (
                            <span className="text-gray-400 text-sm">
                              No image
                            </span>
                          )
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
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      <p className="text-gray-500 text-sm">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-medium" suppressHydrationWarning>
                        $
                        {
                          formatPrice((item.price * item.quantity).toString())
                            .value
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium" suppressHydrationWarning>
                    ${formatPrice(cart.total.toString()).value}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold" suppressHydrationWarning>
                    ${formatPrice(cart.total.toString()).value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
