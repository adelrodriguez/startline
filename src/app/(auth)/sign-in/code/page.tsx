import { cookies } from "next/headers"
import CheckSignInCodeForm from "./_components/CheckSignInCodeForm"
import { redirect } from "next/navigation"

export default function Page() {
  const email = cookies().get("verification-email")?.value ?? null

  if (!email) {
    return redirect("/sign-in")
  }

  return (
    <div>
      <h1>Verify your sign in code</h1>
      <CheckSignInCodeForm />
    </div>
  )
}
