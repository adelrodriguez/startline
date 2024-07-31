import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CheckSignInCodeForm from "./_components/CheckSignInCodeForm"

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
