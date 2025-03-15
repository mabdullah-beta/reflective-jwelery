import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NeonProduct } from "@lib/data/neon-products"

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
}: NeonProduct) {
  const formatPrice = (value: string | null) => {
    if (!value) return '0.00'
    const numericPrice = parseFloat(value)
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2)
  }

  const formatProductUrl = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  return (
    <LocalizedClientLink
      href={`/store/products/${formatProductUrl(product_name)}`}
      className="group"
    >
      <div>
        <div className="relative aspect-[29/34] w-full overflow-hidden rounded-lg bg-gray-100">
          <div className="absolute bottom-2 left-2 flex flex-col gap-1">
            {stock_quantity === 0 && (
              <Text className="text-ui-fg-base bg-white px-2 py-1 rounded-md">
                Out of stock
              </Text>
            )}
            {free_shipping === 1 && (
              <Text className="text-ui-fg-base bg-green-100 px-2 py-1 rounded-md text-sm">
                Free Shipping
              </Text>
            )}
            {for_gender && (
              <Text className="text-ui-fg-base bg-blue-100 px-2 py-1 rounded-md text-sm">
                {for_gender === 'FM' || for_gender === 'MF' ? 'Male and Female' :
                 for_gender === 'M' ? 'Male' :
                 for_gender === 'F' ? 'Female' : for_gender}
              </Text>
            )}
            {categories && categories.length > 0 && (
              <Text className="text-ui-fg-base bg-gray-100 px-2 py-1 rounded-md text-sm">
                {categories[0].category_name}
                {categories.length > 1 && ' +' + (categories.length - 1)}
              </Text>
            )}
          </div>
        </div>
        <div className="mt-2">
          <Text className="text-ui-fg-subtle">{product_name}</Text>
          <div className="mt-1 flex items-center justify-between">
            <Text className="text-ui-fg-base font-semibold">
              ${formatPrice(price)}
            </Text>
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