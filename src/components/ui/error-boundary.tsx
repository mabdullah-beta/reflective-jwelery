"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Text } from "@medusajs/ui"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="content-container py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <Text className="text-red-500">
                Something went wrong. Please try refreshing the page.
              </Text>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
