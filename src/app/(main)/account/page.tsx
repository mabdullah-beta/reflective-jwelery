"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentCustomer, signOut } from "../../../services/account"
import { Customer } from "../../../types/account"
import { Button, Container, Text, clx, Badge, toast } from "@medusajs/ui"
import LoadingSpinner from "../../../components/ui/LoadingSpinner"
import { User, Mail, Phone, Building, CheckCircle, LogOut } from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setError(null)
        const customer = await getCurrentCustomer()
        if (!customer) {
          router.replace("/account/signin")
          return
        }
        setCustomer(customer)
        toast.success("Welcome back!", {
          description: `Signed in as ${customer.email}`,
        })
      } catch (error) {
        console.error("Error fetching customer:", error)
        setError("Failed to load account information. Please try again.")
        toast.error("Error loading account", {
          description: "Please try refreshing the page",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setError(null)
      await signOut()
      toast.success("Signed out successfully", {
        description: "You have been logged out of your account",
      })
      // Add a small delay to show the success message before redirecting
      setTimeout(() => {
        router.replace("/account/signin")
      }, 1000)
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out. Please try again.")
      toast.error("Failed to sign out", {
        description:
          "Please try again or contact support if the issue persists",
      })
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!customer) {
    return null
  }

  return (
    <div className="content-container py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-600">{error}</Text>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ui-fg-base">My Account</h1>
            <Badge color="green" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Signed In</span>
            </Badge>
          </div>
          <p className="text-base-regular text-ui-fg-subtle mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          className={clx(
            "text-red-600 hover:text-red-700 flex items-center gap-2 transition-all duration-200",
            {
              "opacity-50 cursor-not-allowed": isSigningOut,
            }
          )}
          disabled={isSigningOut}
        >
          <LogOut className="w-4 h-4" />
          {isSigningOut ? "Signing out..." : "Log Out"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Container className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-ui-bg-subtle rounded-full">
              <User className="h-5 w-5 text-ui-fg-base" />
            </div>
            <h2 className="text-xl font-semibold text-ui-fg-base">
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                  First Name
                </label>
                <p className="text-base-regular text-ui-fg-base">
                  {customer.first_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                  Last Name
                </label>
                <p className="text-base-regular text-ui-fg-base">
                  {customer.last_name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                Email
              </label>
              <p className="text-base-regular text-ui-fg-base">
                {customer.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                  Phone
                </label>
                <p className="text-base-regular text-ui-fg-base">
                  {customer.phone || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                  Cell Phone
                </label>
                <p className="text-base-regular text-ui-fg-base">
                  {customer.cellphone || "Not provided"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ui-fg-subtle mb-1">
                Legal Name
              </label>
              <p className="text-base-regular text-ui-fg-base">
                {customer.legal_name || "Not provided"}
              </p>
            </div>
          </div>
        </Container>

        <Container className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-ui-bg-subtle rounded-full">
              <Building className="h-5 w-5 text-ui-fg-base" />
            </div>
            <h2 className="text-xl font-semibold text-ui-fg-base">
              Account Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-ui-bg-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ui-fg-base" />
                <div>
                  <h3 className="text-base-semi text-ui-fg-base">
                    Email Notifications
                  </h3>
                  <p className="text-small-regular text-ui-fg-subtle">
                    Manage your email preferences
                  </p>
                </div>
              </div>
              <Button variant="secondary">Configure</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-ui-bg-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-ui-fg-base" />
                <div>
                  <h3 className="text-base-semi text-ui-fg-base">
                    Phone Settings
                  </h3>
                  <p className="text-small-regular text-ui-fg-subtle">
                    Update your contact information
                  </p>
                </div>
              </div>
              <Button variant="secondary">Update</Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
