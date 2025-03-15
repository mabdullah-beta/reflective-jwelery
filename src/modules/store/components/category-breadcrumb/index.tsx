import { Text } from "@medusajs/ui"
import Link from "next/link"
import { Category } from "@lib/data/categories"

type CategoryBreadcrumbProps = {
  category?: Category
}

export default function CategoryBreadcrumb({ category }: CategoryBreadcrumbProps) {
  if (!category) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-ui-fg-subtle">
      <Link href="/store/products" className="hover:text-ui-fg-base">
        <Text className="text-sm">Store</Text>
      </Link>
      <Text className="text-sm">/</Text>
      <Text className="text-sm">{category.category_name}</Text>
    </div>
  )
} 