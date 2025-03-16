import Link from "next/link"

type PaginationProps = {
  currentPage: number
  totalPages: number
  prevLink: string
  nextLink: string
}

export default function Pagination({
  currentPage,
  totalPages,
  prevLink,
  nextLink,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {currentPage > 1 && (
        <Link
          href={prevLink}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={nextLink}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </div>
  )
} 