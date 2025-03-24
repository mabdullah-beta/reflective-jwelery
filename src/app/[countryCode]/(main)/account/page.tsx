"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentCustomer, signOut } from "../../../../services/account"
import { Customer } from "../../../../types/account"
import { Button } from "@medusajs/ui"

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const customer = await getCurrentCustomer()
        if (!customer) {
          router.replace("/signin")
          return
        }
        setCustomer(customer)
      } catch (error) {
        console.error("Error fetching customer:", error)
        router.replace("/signin")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace("/signin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return null // Let the loading.tsx handle the loading state
  }

  if (!customer) {
    return null
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Account</h1>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700"
        >
          Sign Out
        </Button>
      </div>

      <div className="bg-white p-8">
        <h2 className="text-xl mb-8">Profile Information</h2>

        <div className="grid grid-cols-2 gap-x-16 gap-y-6">
          <div>
            <div className="text-sm mb-2">First Name</div>
            <div>{customer.first_name}</div>
          </div>

          <div>
            <div className="text-sm mb-2">Last Name</div>
            <div>{customer.last_name}</div>
          </div>

          <div>
            <div className="text-sm mb-2">Email</div>
            <div>{customer.email}</div>
          </div>

          <div>
            <div className="text-sm mb-2">Phone</div>
            <div>{customer.phone || "Not provided"}</div>
          </div>

          <div>
            <div className="text-sm mb-2">Cell Phone</div>
            <div>{customer.cellphone || "Not provided"}</div>
          </div>

          <div>
            <div className="text-sm mb-2">Legal Name</div>
            <div>{customer.legal_name || "Not provided"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
