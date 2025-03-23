import { Metadata } from "next"
import { getWishlist } from "@lib/data/neon-wishlist"
import WishlistTemplate from "@modules/wishlist/templates/wishlist"

export const metadata: Metadata = {
  title: "Wishlist | Reflective Jewelry",
  description: "View your wishlist",
}

export default async function Wishlist() {
  const wishlist = await getWishlist()

  return <WishlistTemplate wishlist={wishlist} />
}
