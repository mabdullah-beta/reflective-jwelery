import SignUpForm from "../../../../components/ui/account/SignUpForm"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="content-container py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <SignUpForm />

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/account/signin"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
