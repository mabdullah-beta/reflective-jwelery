import { Category, getCategoryHierarchy } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "lucide-react"

type CategoryBreadcrumbProps = {
  category?: Category
}

export default async function CategoryBreadcrumb({ category }: CategoryBreadcrumbProps) {
  if (!category) {
    return null
  }

  const hierarchy = await getCategoryHierarchy(category.category_id)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-600">
      <LocalizedClientLink 
        href="/store" 
        className="hover:text-blue-600 transition-colors"
      >
        Store
      </LocalizedClientLink>
      
      {hierarchy.map((cat, index) => (
        <div key={cat.category_id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {index === hierarchy.length - 1 ? (
            <span className="font-medium text-gray-900">
              {cat.category_name}
            </span>
          ) : (
            <LocalizedClientLink 
              href={`/store?category=${cat.category_id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {cat.category_name}
            </LocalizedClientLink>
          )}
        </div>
      ))}
    </nav>
  )
} 