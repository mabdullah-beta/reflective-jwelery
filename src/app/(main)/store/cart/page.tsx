import { Metadata } from "next"
import NeonCartTemplate from "@modules/cart/templates/neon-cart"

export const metadata: Metadata = {
  title: "Cart | Reflective Jewelry",
  description: "View your cart",
}

export default async function Cart() {
  return <NeonCartTemplate />
}
