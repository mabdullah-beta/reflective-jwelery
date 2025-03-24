"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "../../../services/account"
import { Button } from "@medusajs/ui"

export default function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn({ email, password: "" })
      router.replace("/")
    } catch (err) {
      setError("Invalid email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
