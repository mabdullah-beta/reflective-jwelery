import {
  Customer,
  SignInCredentials,
  SignUpCredentials,
} from "../types/account"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function signIn(
  credentials: SignInCredentials
): Promise<Customer> {
  const response = await fetch(`${API_URL}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error("Failed to sign in")
  }

  return response.json()
}

export async function signUp(
  credentials: SignUpCredentials
): Promise<Customer> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error)
  }

  return data
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching current customer:", error)
    return null
  }
}

export async function signOut(): Promise<void> {
  await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
}
