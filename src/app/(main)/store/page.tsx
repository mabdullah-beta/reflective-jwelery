import { Heading } from "@medusajs/ui"
import { listNeonProducts, type NeonProduct } from "@lib/data/neon-products"
import { getAllCategories, getCategoryById } from "@lib/data/categories"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import CategoryFilter from "@modules/store/components/category-filter"
import CategoryBreadcrumb from "@modules/store/components/category-breadcrumb"
import SearchBar from "@modules/store/components/search-bar"
import { Metadata } from "next"
import Pagination from "@modules/common/components/pagination"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

const PRODUCTS_PER_PAGE = 12

type Props = {
  searchParams: {
    category?: string
    page?: string
    search?: string
  }
}

// Separate component for the product grid to enable Suspense
async function ProductGrid({
  currentPage,
  selectedCategoryId,
  searchQuery,
}: {
  currentPage: number
  selectedCategoryId?: number
  searchQuery: string
}) {
  const { products, count } = await listNeonProducts({
    limit: PRODUCTS_PER_PAGE,
    offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
    categoryId: selectedCategoryId,
    search: searchQuery,
  })

  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

  return (
    <>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8">
        {products.map((product: NeonProduct) => (
          <li key={product.product_id}>
            <NeonProductPreview {...product} />
          </li>
        ))}
      </ul>

      {products.length === 0 && !searchQuery && (
        <div className="py-12 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            No products found in this category.
          </p>
          <a
            href="/store"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all products
          </a>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            prevLink={`/store?page=${currentPage - 1}${
              selectedCategoryId ? `&category=${selectedCategoryId}` : ""
            }${searchQuery ? `&search=${searchQuery}` : ""}`}
            nextLink={`/store?page=${currentPage + 1}${
              selectedCategoryId ? `&category=${selectedCategoryId}` : ""
            }${searchQuery ? `&search=${searchQuery}` : ""}`}
          />
        </div>
      )}
    </>
  )
}

export const metadata: Metadata = {
  title: "Store | Reflective Jewelry",
  description: "Browse all our jewelry pieces.",
}

export default async function StorePage({ searchParams }: Props) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const selectedCategoryId = searchParams.category
    ? parseInt(searchParams.category)
    : undefined
  const searchQuery = searchParams.search || ""

  const [categories, selectedCategoryResult, { count }] = await Promise.all([
    getAllCategories(),
    selectedCategoryId
      ? getCategoryById(selectedCategoryId)
      : Promise.resolve(undefined),
    listNeonProducts({
      limit: PRODUCTS_PER_PAGE,
      offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
      categoryId: selectedCategoryId,
      search: searchQuery,
    }),
  ])

  const selectedCategory = selectedCategoryResult || undefined

  return (
    <div className="content-container py-6">
      <div className="flex flex-col gap-6">
        <CategoryBreadcrumb category={selectedCategory} />

        <div className="flex flex-col items-center text-center">
          <Heading level="h1" className="text-2xl-semi">
            {selectedCategory ? selectedCategory.category_name : "All Products"}
          </Heading>
          <p className="text-base-regular text-gray-600 mt-2">
            {selectedCategory
              ? `Browse our ${selectedCategory.category_name.toLowerCase()} collection`
              : "Browse through our entire collection"}
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Searching for "{searchQuery}"...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {count} {count === 1 ? "product" : "products"} found
                </p>
              </div>
              <a
                href="/store"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear search
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col small:flex-row gap-8">
          {/* Category Filter Sidebar */}
          <div className="w-full small:w-80 small:sticky small:top-20 small:h-fit">
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
            />
          </div>

          {/* Product Grid with Loading State */}
          <div className="flex-1">
            <Suspense fallback={<SkeletonProductGrid />}>
              <ProductGrid
                currentPage={currentPage}
                selectedCategoryId={selectedCategoryId}
                searchQuery={searchQuery}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
