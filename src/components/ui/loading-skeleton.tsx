import { cn } from "@lib/util"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
      <Skeleton className="aspect-[29/34] w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export function RelatedProductsSkeleton() {
  return (
    <div className="mt-16 space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[29/34] w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
} 