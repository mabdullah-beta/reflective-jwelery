import { Metadata } from "next"
import { listNeonProducts } from "@lib/data/neon-products"
import NeonProductPreview from "@modules/products/components/neon-product-preview"

export const metadata: Metadata = {
  title: "Store | Reflective Jewelry",
  description: "Browse all our jewelry pieces.",
}

export default async function StorePage() {
  const products = await listNeonProducts()

  return (
    <div className="flex flex-col py-6">
      <div className="content-container">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-2xl-semi">All Products</h1>
          <p className="text-base-regular text-gray-600 mt-2">
            Browse through our entire collection
          </p>
        </div>
        <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8">
          {products.map((product) => (
            <li key={product.id}>
              <NeonProductPreview {...product} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
