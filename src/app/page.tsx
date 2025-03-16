import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import { listNeonProducts, NeonProduct } from "@lib/data/neon-products"
import NeonProductPreview from "@modules/products/components/neon-product-preview"

export const metadata: Metadata = {
  title: "Reflective Jewelry Store",
  description: "Browse our collection of beautiful jewelry pieces.",
}

export default async function Home() {
  const { products } = await listNeonProducts({ limit: 6 })
  
  // Log the products data
  console.log('Homepage Products:', JSON.stringify(products, null, 2))

  return (
    <>
      <Hero />
      <div className="py-12">
        <div className="content-container">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-2xl-semi">Latest Products</h2>
            <p className="text-base-regular text-gray-600 mt-2">
              Check out our newest jewelry pieces
            </p>
          </div>
          <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8">
            {products.map((product: NeonProduct) => (
              <li key={`product-${product.product_id}`}>
                <NeonProductPreview {...product} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
} 