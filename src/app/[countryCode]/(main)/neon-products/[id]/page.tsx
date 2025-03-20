import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNeonProduct, getRelatedNeonProducts } from "@lib/data/neon-products"
import { Heading, Text } from "@medusajs/ui"
import NeonProductPreview from "@modules/products/components/neon-product-preview"

type Props = {
  params: { id: string }
}

export default async function NeonProductPage({ params }: Props) {
  const productId = parseInt(params.id)
  if (isNaN(productId)) {
    return notFound()
  }

  const product = await getNeonProduct(productId)
  if (!product) {
    return notFound()
  }

  const relatedProducts = await getRelatedNeonProducts(product)

  return (
    <div className="content-container flex flex-col py-6 relative">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
        {/* Left column - Product image placeholder */}
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Text className="text-gray-400">No Image</Text>
          </div>
        </div>

        {/* Right column - Product details */}
        <div className="flex flex-col gap-y-6">
          <div>
            <Heading level="h1" className="text-3xl font-bold mb-2">
              {product.product_name}
            </Heading>
            {product.brand && (
              <Text className="text-ui-fg-subtle mb-4">
                Brand: {product.brand}
              </Text>
            )}
          </div>

          <div className="flex items-center gap-x-4">
            {(() => {
              const parsedPrice = parseFloat(
                product.price?.replace(/[^0-9.-]+/g, "") || "0"
              )
              if (
                !product.price ||
                product.price.trim() === "" ||
                product.price === "null" ||
                isNaN(parsedPrice) ||
                parsedPrice <= 0
              ) {
                return (
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
                )
              }
              return (
                <Text className="text-xl-semi">${parsedPrice.toFixed(2)}</Text>
              )
            })()}
            {(() => {
              const parsedOldPrice = parseFloat(
                product.old_price?.replace(/[^0-9.-]+/g, "") || "0"
              )
              if (
                product.old_price &&
                product.old_price.trim() !== "" &&
                product.old_price !== "null" &&
                !isNaN(parsedOldPrice) &&
                parsedOldPrice > 0
              ) {
                return (
                  <Text className="text-ui-fg-muted line-through">
                    ${parsedOldPrice.toFixed(2)}
                  </Text>
                )
              }
              return null
            })()}
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
          </div>

          <div className="flex gap-2">
            {product.top_seller && (
              <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">
                Top Seller
              </span>
            )}
            {product.free_shipping && (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                Free Shipping
              </span>
            )}
          </div>

          <button
            className="btn-primary w-full h-12 bg-black text-white rounded-md hover:bg-gray-900 transition-colors"
            disabled={product.stock_quantity === 0}
          >
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <Heading level="h2" className="text-2xl mb-8">
            Related Products
          </Heading>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
            {relatedProducts.map((relatedProduct) => (
              <li key={relatedProduct.product_id}>
                <NeonProductPreview {...relatedProduct} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const productId = parseInt(params.id)
  if (isNaN(productId)) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    }
  }

  const product = await getNeonProduct(productId)
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    }
  }

  return {
    title: product.meta_title || product.product_name,
    description:
      product.meta_description || product.full_description || undefined,
    keywords: product.meta_keywords || undefined,
  }
}
