import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Order Successful | Reflective Jewelry",
  description: "Thank you for your purchase",
}

export default function CheckoutSuccess() {
  return (
    <div className="bg-white min-h-[640px] flex items-center justify-center">
      <div className="max-w-[500px] flex flex-col items-center gap-y-4 text-center px-4">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Thank you for your order!</h1>
        <p className="text-gray-600">
          We've received your order and will begin processing it right away.
          You'll receive an email confirmation shortly.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/store"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
