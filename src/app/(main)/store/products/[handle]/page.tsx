import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getNeonProductByName,
  getRelatedNeonProducts,
} from "@lib/data/neon-products"
import { Heading, Text } from "@medusajs/ui"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import { Suspense } from "react"
import Image from "next/image"

// Add metadata export for better SEO
export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

type Props = {
  params: { handle: string }
}

// Separate product details component for better code organization
function ProductDetails({
  product,
}: {
  product: Awaited<ReturnType<typeof getNeonProductByName>>
}) {
  if (!product) return null

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <Heading level="h1" className="text-3xl font-bold mb-2">
          {product.product_name}
        </Heading>
        {product.brand && (
          <Text className="text-ui-fg-subtle mb-2">Brand: {product.brand}</Text>
        )}
      </div>

      <div className="flex items-center gap-x-4">
        <Text className="text-xl-semi">
          ${parseFloat(product.price).toFixed(2)}
        </Text>
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
        {product.sku_number && (
          <div>
            <Text className="font-semibold">SKU</Text>
            <Text>{product.sku_number}</Text>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {product.free_shipping === 1 && (
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
            Free Shipping
          </span>
        )}
        {product.for_gender && (
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
            {product.for_gender === "FM" || product.for_gender === "MF"
              ? "Male and Female"
              : product.for_gender === "M"
              ? "Male"
              : product.for_gender === "F"
              ? "Female"
              : product.for_gender}
          </span>
        )}
        {product.top_seller && (
          <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">
            Top Seller
          </span>
        )}
        {product.rij_favorite && (
          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded">
            Staff Pick
          </span>
        )}
        {product.tags?.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {product.options && product.options.length > 0 && (
        <div className="mt-6">
          <Text className="font-semibold text-lg mb-4">Product Options</Text>
          <div className="space-y-6">
            {product.options.map((option) => (
              <div key={option.option_id} className="border rounded-lg p-4">
                <Text className="font-semibold mb-2">
                  {option.display_name}
                </Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {option.values.map((value) => (
                    <div
                      key={value.option_value_id}
                      className="border rounded p-3"
                    >
                      <Text className="font-medium">{value.display_name}</Text>
                      {value.price_adjustment !== "0" && (
                        <Text className="text-sm text-gray-600">
                          {value.price_adjustment_type === "percentage"
                            ? `${value.price_adjustment}%`
                            : `$${value.price_adjustment}`}
                          {value.price_adjustment_type === "percentage"
                            ? " adjustment"
                            : " additional"}
                        </Text>
                      )}
                      {value.apply_sale && (
                        <Text className="text-sm text-green-600">
                          Sale eligible
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn-primary w-full h-12 bg-black text-white rounded-md hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={product.stock_quantity === 0}
      >
        {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  )
}

// Separate related products component
function RelatedProducts({
  products,
}: {
  products: Awaited<ReturnType<typeof getRelatedNeonProducts>>
}) {
  if (!products.length) return null

  return (
    <div className="mt-16">
      <Heading level="h2" className="text-2xl mb-8">
        Related Products
      </Heading>
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((relatedProduct) => (
          <li key={relatedProduct.product_id}>
            <Suspense
              fallback={
                <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <NeonProductPreview {...relatedProduct} />
            </Suspense>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ProductPage({ params }: Props) {
  if (!params.handle) {
    console.error("No handle provided in params:", params)
    notFound()
  }

  try {
    const product = await getNeonProductByName(params.handle)

    if (!product) {
      console.error("Product not found for handle:", params.handle)
      notFound()
    }

    const relatedProducts = await getRelatedNeonProducts(product)

    return (
      <div className="content-container py-6">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
          {/* Product Image with optimization */}
          <div className="relative aspect-[29/34] w-full bg-gray-100 rounded-lg overflow-hidden">
            {/* Since we don't have assets yet, show placeholder */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Product image coming soon</span>
            </div>
          </div>

          {/* Product Details with Suspense boundary */}
          <Suspense
            fallback={
              <div className="animate-pulse bg-gray-100 h-full rounded-lg" />
            }
          >
            <ProductDetails product={product} />
          </Suspense>
        </div>

        {/* Related Products with Suspense boundary */}
        <Suspense
          fallback={
            <div className="animate-pulse bg-gray-100 h-[200px] mt-16 rounded-lg" />
          }
        >
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error in product page:", error)
    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.handle) {
    return {
      title: "Product Not Found | Reflective Jewelry",
      description: "The requested product could not be found",
    }
  }

  try {
    const product = await getNeonProductByName(params.handle)

    if (!product) {
      return {
        title: "Product Not Found | Reflective Jewelry",
        description: "The requested product could not be found",
      }
    }

    return {
      title: `${product.product_name} | Reflective Jewelry`,
      description:
        product.full_description ||
        `View details and purchase ${product.product_name}`,
      openGraph: {
        title: product.product_name,
        description:
          product.full_description ||
          `View details and purchase ${product.product_name}`,
      },
      twitter: {
        card: "summary_large_image",
        title: product.product_name,
        description:
          product.full_description ||
          `View details and purchase ${product.product_name}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error, "\nParams:", params)
    throw error
  }
}
