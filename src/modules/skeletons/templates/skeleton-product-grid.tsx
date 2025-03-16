const SkeletonProductGrid = () => {
  return (
    <div className="grid grid-cols-2 small:grid-cols-3 gap-x-4 gap-y-8 animate-pulse">
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex flex-col">
            {/* Product Image Skeleton */}
            <div className="relative aspect-[9/16] w-full bg-gray-100 rounded-lg overflow-hidden mb-2" />

            {/* Product Title Skeleton */}
            <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />

            {/* Product Price Skeleton */}
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
          </div>
        ))}
    </div>
  )
}

export default SkeletonProductGrid
