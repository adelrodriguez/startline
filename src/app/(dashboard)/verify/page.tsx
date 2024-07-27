import { getCurrentUser } from "@/server/loader"
import { redirect } from "next/navigation"
import CheckVerifyEmailCodeForm from "./_components/CheckVerifyEmailCode"

export default async function Page() {
  const user = await getCurrentUser()

  if (user.emailVerifiedAt) {
    return redirect("/my")
  }

  return (
    <div>
      <h1>Verify your email</h1>
      <CheckVerifyEmailCodeForm />
    </div>
  )
}
