import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NeonProduct } from "@lib/data/neon-products"
import { formatPrice } from "@lib/util/format-price"
import { formatProductUrl } from "@lib/util/format-product-url"
import Image from "next/image"

const getImageUrl = (image: any) => {
  if (!image) {
    console.log("No image data provided")
    return null
  }

  // Clean up the filename - remove any path-like characters and trim
  const cleanFilename = image.filename.trim().replace(/^[./\\]+/, "")

  // Handle different path patterns
  if (image.file_path.includes("MerchantShoppingCartImages/MGenImages_1/")) {
    const url = `/images/artisans/${encodeURIComponent(cleanFilename)}`
    console.log("Artisan image URL:", url)
    return url
  }

  const url = `/images/products/${encodeURIComponent(cleanFilename)}`
  console.log("Product image URL:", url)
  return url
}

export default function NeonProductPreview({
  product_id,
  product_name,
  full_description,
  price,
  stock_quantity,
  dimension,
  dimension_name,
  sku_number,
  free_shipping,
  for_gender,
  categories,
  images,
}: NeonProduct) {
  const formattedPrice = formatPrice(price)
  const formattedUrl = formatProductUrl(product_name)

  // Get the main product image (first image or null)
  const mainImage = images?.[0]
  const imageUrl = getImageUrl(mainImage)

  console.log("Product Details:", {
    product_id,
    product_name,
    totalImages: images?.length || 0,
    mainImage: mainImage?.filename,
    imageUrl,
  })

  return (
    <LocalizedClientLink
      href={`/store/products/${formattedUrl}`}
      className="group"
    >
      <div>
        <div className="relative aspect-[29/34] w-full overflow-hidden rounded-lg bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={mainImage?.media_caption || product_name}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Text className="text-ui-fg-subtle">No image available</Text>
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
            {stock_quantity === 0 && (
              <Text className="text-ui-fg-base bg-white/90 px-2 py-1 rounded-md">
                Out of stock
              </Text>
            )}
            {free_shipping === 1 && (
              <Text className="text-ui-fg-base bg-green-100/90 px-2 py-1 rounded-md text-sm">
                Free Shipping
              </Text>
            )}
            {for_gender && (
              <Text className="text-ui-fg-base bg-blue-100/90 px-2 py-1 rounded-md text-sm">
                {for_gender === "FM" || for_gender === "MF"
                  ? "Male and Female"
                  : for_gender === "M"
                  ? "Male"
                  : for_gender === "F"
                  ? "Female"
                  : for_gender}
              </Text>
            )}
            {categories && categories.length > 0 && (
              <Text className="text-ui-fg-base bg-gray-100/90 px-2 py-1 rounded-md text-sm">
                {categories[0].category_name}
                {categories.length > 1 && " +" + (categories.length - 1)}
              </Text>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Text className="text-ui-fg-subtle">{product_name}</Text>
          <div className="mt-1 flex items-center justify-between">
            {formattedPrice.display === "Call for Pricing" ? (
              <div className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <Text className="text-sm font-medium">Call for Pricing</Text>
              </div>
            ) : (
              <Text className="text-ui-fg-base font-semibold">
                ${formattedPrice.value}
              </Text>
            )}
          </div>
          {full_description && (
            <Text className="text-ui-fg-subtle mt-1 text-sm line-clamp-2">
              {full_description}
            </Text>
          )}
          <div className="mt-2 space-y-1">
            {dimension && dimension_name && (
              <Text className="text-ui-fg-subtle text-sm">
                {dimension_name}: {dimension}
              </Text>
            )}
            {sku_number && (
              <Text className="text-ui-fg-subtle text-sm">
                SKU: {sku_number}
              </Text>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
