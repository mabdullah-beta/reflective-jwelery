import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getNeonProductByName,
  getRelatedNeonProducts,
} from "@lib/data/neon-products"
import { Heading, Text } from "@medusajs/ui"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import { Suspense } from "react"
import { formatPrice, formatOldPrice } from "@lib/util/format-price"
import ProductDetails from "@modules/products/components/neon-product-details"
import Image from "next/image"
import ProductImageGallery from "@modules/products/components/product-image-gallery"

// Add metadata export for better SEO
export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

type Props = {
  params: { handle: string }
}

const getImageUrl = (image: any) => {
  if (!image) return null

  // Clean up the filename - remove any path-like characters and trim
  const cleanFilename = image.filename.trim().replace(/^[./\\]+/, "")

  // Handle different path patterns
  if (image.file_path.includes("MerchantShoppingCartImages/MGenImages_1/")) {
    return `/images/artisans/${encodeURIComponent(cleanFilename)}`
  }

  return `/images/products/${encodeURIComponent(cleanFilename)}`
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

    // Process images and filter out any with null URLs
    const images =
      product.images
        ?.map((image) => {
          const url = getImageUrl(image)
          if (!url) return null
          return {
            media_id: image.media_id,
            url,
            alt: image.media_caption || product.product_name,
            media_caption: image.media_caption || undefined,
          }
        })
        .filter(
          (image): image is NonNullable<typeof image> => image !== null
        ) || []

    return (
      <div className="content-container py-6">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="sticky top-0">
            <ProductImageGallery
              images={images}
              productName={product.product_name}
            />
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
