import { Metadata } from "next"
import { getNeonCart } from "@lib/data/neon-cart"
import CheckoutTemplate from "@modules/checkout/templates/neon-checkout"

export const metadata: Metadata = {
  title: "Checkout | Reflective Jewelry",
  description: "Complete your purchase",
}

export default async function Checkout() {
  const cart = await getNeonCart()

  if (!cart || !cart.items.length) {
    return (
      <div className="bg-white min-h-[640px] flex items-center justify-center">
        <div className="max-w-[500px] flex flex-col items-center gap-y-4">
          <h1 className="text-2xl font-bold">Cart is empty</h1>
          <p className="text-gray-700">
            You don't have anything in your cart. Let's change that!
          </p>
          <a
            href="/store"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            Explore products
          </a>
        </div>
      </div>
    )
  }

  return <CheckoutTemplate cart={cart} />
}
