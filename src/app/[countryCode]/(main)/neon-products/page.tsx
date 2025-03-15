import { Suspense } from "react"
import { listNeonProducts } from "@lib/data/neon-products"
import NeonProductPreview from "@modules/products/components/neon-product-preview"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { Heading } from "@medusajs/ui"

export const dynamic = "force-dynamic"

export default async function NeonProductsPage({
  searchParams,
}: {
  searchParams?: { page?: string; sort?: string; search?: string }
}) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1
  const limit = 12
  const offset = (page - 1) * limit

  const { products, count } = await listNeonProducts({
    limit,
    offset,
    sortBy: searchParams?.sort || "created_on",
    search: searchParams?.search || "",
  })

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="flex flex-col py-6 content-container">
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <Heading level="h1">All Products</Heading>
          {searchParams?.search && (
            <p className="text-gray-500 mt-2">
              Search results for: {searchParams.search}
            </p>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <div>
            <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
              {products.map((product) => (
                <li key={product.product_id}>
                  <NeonProductPreview product={product} />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                {/* Add pagination component here */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <a
                      key={pageNum}
                      href={`?page=${pageNum}${searchParams?.sort ? `&sort=${searchParams.sort}` : ""}${
                        searchParams?.search ? `&search=${searchParams.search}` : ""
                      }`}
                      className={`px-4 py-2 border rounded ${
                        page === pageNum
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  )
} 