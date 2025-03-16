import { Heading } from "@medusajs/ui"
import { listNeonProducts, type NeonProduct } from "@lib/data/neon-products"
import { getAllCategories, getCategoryById } from "@lib/data/categories"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import CategoryFilter from "@modules/store/components/category-filter"
import CategoryBreadcrumb from "@modules/store/components/category-breadcrumb"
import SearchBar from "@modules/store/components/search-bar"
import { Metadata } from "next"
import Pagination from "@modules/common/components/pagination"

const PRODUCTS_PER_PAGE = 12

type Props = {
  searchParams: {
    category?: string
    page?: string
    search?: string
  }
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

  const [{ products, count }, categories, selectedCategoryResult] =
    await Promise.all([
      listNeonProducts({
        limit: PRODUCTS_PER_PAGE,
        offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
        categoryId: selectedCategoryId,
        search: searchQuery,
      }),
      getAllCategories(),
      selectedCategoryId
        ? getCategoryById(selectedCategoryId)
        : Promise.resolve(undefined),
    ])

  const selectedCategory = selectedCategoryResult || undefined
  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

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
              <p className="text-gray-600">
                {count === 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    No products found for "{searchQuery}"
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Found {count} product{count === 1 ? "" : "s"} for "
                    {searchQuery}"
                  </span>
                )}
              </p>
              {searchQuery && (
                <a
                  href="/store"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear search
                </a>
              )}
            </div>
            {count === 0 && (
              <div className="mt-4 text-gray-500">
                <p>Suggestions:</p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Check for typos</li>
                  <li>Try using more general keywords</li>
                  <li>Try searching in a different category</li>
                </ul>
              </div>
            )}
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

          {/* Product Grid */}
          <div className="flex-1">
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
          </div>
        </div>
      </div>
    </div>
  )
}
