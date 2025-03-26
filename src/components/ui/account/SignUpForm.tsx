"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "../../../services/account"
import { Button } from "@medusajs/ui"

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  cellphone?: string
  legal_name?: string
}

export default function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cellphone: "",
    legal_name: "",
  })

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // First Name validation
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required"
      isValid = false
    } else if (formData.first_name.length < 2) {
      errors.first_name = "First name must be at least 2 characters"
      isValid = false
    }

    // Last Name validation
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required"
      isValid = false
    } else if (formData.last_name.length < 2) {
      errors.last_name = "Last name must be at least 2 characters"
      isValid = false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    // Phone validation (if provided)
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number"
      isValid = false
    }

    // Cellphone validation (if provided)
    if (formData.cellphone && !/^\+?[\d\s-()]{10,}$/.test(formData.cellphone)) {
      errors.cellphone = "Please enter a valid cell phone number"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFormErrors({}) // Clear any existing form errors

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signUp(formData)
      router.replace("/account")
    } catch (err: any) {
      if (err.message === "Email already exists") {
        setFormErrors((prev) => ({
          ...prev,
          email:
            "This email address is already registered. Please use a different email or sign in.",
        }))
      } else {
        setError(
          err.message || "An unexpected error occurred. Please try again."
        )
      }
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
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.first_name ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="given-name"
          />
          {formErrors.first_name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.last_name ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="family-name"
          />
          {formErrors.last_name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            formErrors.email ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="email"
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
        )}
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
          className={`w-full px-3 py-2 border rounded-md ${
            formErrors.phone ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="tel"
        />
        {formErrors.phone && (
          <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
        )}
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
          className={`w-full px-3 py-2 border rounded-md ${
            formErrors.cellphone ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="tel"
        />
        {formErrors.cellphone && (
          <p className="mt-1 text-sm text-red-500">{formErrors.cellphone}</p>
        )}
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
          className={`w-full px-3 py-2 border rounded-md ${
            formErrors.legal_name ? "border-red-500" : "border-gray-300"
          }`}
          autoComplete="name"
        />
        {formErrors.legal_name && (
          <p className="mt-1 text-sm text-red-500">{formErrors.legal_name}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

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
