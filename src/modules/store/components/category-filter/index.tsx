"use client"

import { Category } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId?: number
}

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]
}

const CategoryFilter = ({ categories, selectedCategoryId }: CategoryFilterProps) => {
  // Organize categories into a tree structure
  const organizeCategories = (cats: Category[]): CategoryWithChildren[] => {
    const categoryMap = new Map<number, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // First pass: create all category objects
    cats.forEach(cat => {
      categoryMap.set(cat.category_id, { ...cat, children: [] })
    })

    // Second pass: organize into tree structure
    cats.forEach(cat => {
      const category = categoryMap.get(cat.category_id)!
      if (cat.parent_category_id === null) {
        rootCategories.push(category)
      } else {
        const parent = categoryMap.get(cat.parent_category_id)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(category)
        }
      }
    })

    return rootCategories
  }

  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const rootCategories = organizeCategories(categories)

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const CategoryItem = ({ category, level = 0 }: { category: CategoryWithChildren, level?: number }) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.includes(category.category_id)
    const isSelected = category.category_id === selectedCategoryId

    return (
      <div className="w-full">
        <div className={`flex items-center gap-1 group ${level > 0 ? 'ml-4' : ''}`}>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.category_id)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <LocalizedClientLink
            href={`/store?category=${category.category_id}`}
            className={`
              py-2 px-2 rounded-md text-sm flex-grow transition-colors
              hover:bg-gray-100
              ${isSelected ? 'bg-gray-100 font-medium text-blue-600' : 'text-gray-700'}
            `}
          >
            <span className="flex items-center justify-between">
              <span>{category.category_name}</span>
              {hasChildren && (
                <span className="text-xs text-gray-500">
                  {category.children?.length}
                </span>
              )}
            </span>
          </LocalizedClientLink>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children?.map(child => (
              <CategoryItem 
                key={child.category_id} 
                category={child} 
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium mb-4">Categories</h2>
      <div className="flex flex-col gap-1">
        <LocalizedClientLink
          href="/store"
          className={`
            py-2 px-2 rounded-md text-sm transition-colors
            hover:bg-gray-100
            ${!selectedCategoryId ? 'bg-gray-100 font-medium text-blue-600' : 'text-gray-700'}
          `}
        >
          All Products
        </LocalizedClientLink>
        {rootCategories.map(category => (
          <CategoryItem 
            key={category.category_id} 
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter 