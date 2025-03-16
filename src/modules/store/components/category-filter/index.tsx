"use client"

import { Text } from "@medusajs/ui"
import { Category } from "@lib/data/categories"
import { useRouter, useSearchParams } from "next/navigation"

type CategoryFilterProps = {
  categories: Category[]
  selectedCategoryId?: number
}

export default function CategoryFilter({ categories, selectedCategoryId }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategoryId === categoryId) {
      // If clicking the same category, remove the filter
      params.delete('category')
    } else {
      // Otherwise, set the new category filter
      params.set('category', categoryId.toString())
    }
    
    router.push(`/store?${params.toString()}`)
  }

  // Organize categories into a hierarchy
  const parentCategories = categories.filter(cat => cat.parent_category_id === null)
  const getChildCategories = (parentId: number) => 
    categories.filter(cat => cat.parent_category_id === parentId)

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.category_id} style={{ marginLeft: `${level * 16}px` }}>
      <button
        onClick={() => handleCategoryClick(category.category_id)}
        className={`text-left px-4 py-2 w-full rounded-md transition-colors ${
          selectedCategoryId === category.category_id
            ? 'bg-gray-100 text-ui-fg-base'
            : 'hover:bg-gray-50 text-ui-fg-subtle'
        }`}
      >
        <Text className="text-sm">{category.category_name}</Text>
      </button>
      {/* Render child categories recursively */}
      {getChildCategories(category.category_id).map(child => 
        renderCategory(child, level + 1)
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <Text className="text-ui-fg-base font-semibold">Categories</Text>
      <div className="flex flex-col gap-2">
        {parentCategories.map(category => renderCategory(category))}
      </div>
    </div>
  )
} 