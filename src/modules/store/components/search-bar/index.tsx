"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import debounce from "lodash/debounce"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  )
  const [isSearching, setIsSearching] = useState(false)

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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search for products..."
          className="w-full pl-11 pr-12 py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          aria-label="Search products"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {isSearching && (
        <div className="mt-2 text-sm text-gray-500 text-center">
          Searching...
        </div>
      )}
    </div>
  )
}
