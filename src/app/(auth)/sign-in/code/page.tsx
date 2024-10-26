import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { VERIFICATION_EMAIL_COOKIE_NAME } from "~/lib/consts"
import CheckSignInCodeForm from "./_components/check-sign-in-code-form"

export default async function Page() {
  const cookieStore = await cookies()
  const email = cookieStore.get(VERIFICATION_EMAIL_COOKIE_NAME)?.value ?? null

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
          <CheckSignInCodeForm email={email} />
        </CardContent>
      </Card>
    </div>
  )
}
