import ErrorBoundary from "../../../components/ui/error-boundary"
import { Toaster } from "@medusajs/ui"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Toaster />
      </div>
    </ErrorBoundary>
  )
}
