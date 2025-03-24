import SignInForm from "../../../../components/ui/account/SignInForm"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="content-container py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <SignInForm />

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/account/signup"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
