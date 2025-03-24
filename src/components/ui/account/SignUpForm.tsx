"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "../../../services/account"
import { Button } from "@medusajs/ui"

export default function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cellphone: "",
    legal_name: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signUp(formData)
      router.replace("/account")
    } catch (err) {
      setError("Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            autoComplete="given-name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="cellphone" className="block text-sm font-medium mb-1">
          Cell Phone
        </label>
        <input
          type="tel"
          name="cellphone"
          id="cellphone"
          value={formData.cellphone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="legal_name" className="block text-sm font-medium mb-1">
          Legal Name
        </label>
        <input
          type="text"
          name="legal_name"
          id="legal_name"
          value={formData.legal_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          autoComplete="name"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  )
}
