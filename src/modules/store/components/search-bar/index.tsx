"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import debounce from "lodash/debounce"

const SearchSkeleton = () => {
  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigation state when search params or pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [searchParams, pathname])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }

      // Reset to first page when searching
      params.delete("page")

      router.push(`/store?${params.toString()}`)
      setIsSearching(false)
    }, 500),
    [searchParams, router]
  )

  // Update search when input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    setIsSearching(true)
    debouncedSearch(value)
  }

  // Handle form submission (Enter key press)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue) return

    setIsNavigating(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("search", searchValue)
    params.delete("page")
    router.push(`/store?${params.toString()}`)
  }

  // Clear search
  const handleClear = () => {
    setSearchValue("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    router.push(`/store?${params.toString()}`)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <div className="w-full max-w-[600px] mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isNavigating ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search
              className={`h-5 w-5 ${
                isSearching ? "text-blue-500 animate-pulse" : "text-gray-400"
              }`}
            />
          )}
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search for products..."
          className={`w-full pl-11 pr-12 py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
            isNavigating ? "opacity-50" : ""
          }`}
          aria-label="Search products"
          disabled={isNavigating}
        />
        {searchValue && !isNavigating && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>
      {isSearching && searchValue && <SearchSkeleton />}
    </div>
  )
}
