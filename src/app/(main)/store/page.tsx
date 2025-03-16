import { Heading } from "@medusajs/ui"
import { listNeonProducts } from "@lib/data/neon-products"
import { getAllCategories, getCategoryById, Category } from "@lib/data/categories"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import CategoryFilter from "@modules/store/components/category-filter"
import CategoryBreadcrumb from "@modules/store/components/category-breadcrumb"
import { Metadata } from "next"
import Pagination from "@modules/common/components/pagination"

const PRODUCTS_PER_PAGE = 12

type Props = {
  searchParams: {
    category?: string
    page?: string
  }
}

export const metadata: Metadata = {
  title: "Store | Reflective Jewelry",
  description: "Browse our collection of beautiful jewelry pieces.",
}

export default async function StorePage({ searchParams }: Props) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const selectedCategoryId = searchParams.category ? parseInt(searchParams.category) : undefined

  const [{ products, count }, categories, selectedCategoryResult] = await Promise.all([
    listNeonProducts({
      limit: PRODUCTS_PER_PAGE,
      offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
      categoryId: selectedCategoryId
    }),
    getAllCategories(),
    selectedCategoryId ? getCategoryById(selectedCategoryId) : Promise.resolve(undefined)
  ])

  const selectedCategory = selectedCategoryResult || undefined
  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

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
              {products.map((product) => (
                <li key={product.product_id}>
                  <NeonProductPreview {...product} />
                </li>
              ))}
            </ul>
            
            {products.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No products found in this category.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  prevLink={`/store?page=${currentPage - 1}${selectedCategoryId ? `&category=${selectedCategoryId}` : ''}`}
                  nextLink={`/store?page=${currentPage + 1}${selectedCategoryId ? `&category=${selectedCategoryId}` : ''}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 