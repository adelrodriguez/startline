import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { VERIFICATION_EMAIL_COOKIE_NAME } from "@/lib/consts"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CheckSignInCodeForm from "./_components/CheckSignInCodeForm"

export default function Page() {
  const email = cookies().get(VERIFICATION_EMAIL_COOKIE_NAME)?.value ?? null

  if (!email) {
    return redirect("/sign-in")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle>Verify your sign in code</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckSignInCodeForm />
        </CardContent>
      </Card>
    </div>
  )
}
