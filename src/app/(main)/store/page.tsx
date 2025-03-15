import { Heading } from "@medusajs/ui"
import { listNeonProducts } from "@lib/data/neon-products"
import { getAllCategories, getCategoryById } from "@lib/data/categories"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import CategoryFilter from "@modules/store/components/category-filter"
import CategoryBreadcrumb from "@modules/store/components/category-breadcrumb"
import { Metadata } from "next"

type Props = {
  searchParams: {
    category?: string
  }
}

export const metadata: Metadata = {
  title: "Store | Reflective Jewelry",
  description: "Browse our collection of beautiful jewelry pieces.",
}

export default async function StorePage({ searchParams }: Props) {
  const selectedCategoryId = searchParams.category ? parseInt(searchParams.category) : undefined

  const [products, categories, selectedCategory] = await Promise.all([
    listNeonProducts(),
    getAllCategories(),
    selectedCategoryId ? getCategoryById(selectedCategoryId).then(cat => cat || undefined) : Promise.resolve(undefined)
  ])

  // Filter products by category if a category is selected
  const filteredProducts = selectedCategoryId
    ? products.filter(product => 
        product.categories?.some(category => category.category_id === selectedCategoryId)
      )
    : products

  return (
    <div className="content-container py-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <CategoryBreadcrumb category={selectedCategory} />
          <div className="flex flex-col items-center text-center">
            <Heading level="h1" className="text-2xl-semi">
              {selectedCategory ? selectedCategory.category_name : 'All Products'}
            </Heading>
            <p className="text-base-regular text-gray-600 mt-2">
              {selectedCategory 
                ? `Browse our ${selectedCategory.category_name.toLowerCase()} collection`
                : 'Browse through our entire collection'}
            </p>
          </div>
        </div>

        <div className="flex flex-col small:flex-row gap-8">
          {/* Category Filter Sidebar */}
          <div className="w-full small:w-80 small:sticky small:top-20 small:h-fit">
            <CategoryFilter 
              categories={categories} 
              selectedCategoryId={selectedCategoryId}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8">
              {filteredProducts.map((product) => (
                <li key={product.product_id}>
                  <NeonProductPreview {...product} />
                </li>
              ))}
            </ul>
            
            {filteredProducts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 