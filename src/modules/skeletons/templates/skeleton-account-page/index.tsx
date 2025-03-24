const SkeletonAccountPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="w-48 h-8 bg-gray-200 animate-pulse rounded mb-6" />

      <div className="bg-white shadow rounded-lg p-6">
        <div className="w-40 h-6 bg-gray-200 animate-pulse rounded mb-4" />

        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index}>
              <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="w-32 h-5 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonAccountPage
