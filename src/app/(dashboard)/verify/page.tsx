import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { getCurrentUser } from "~/server/loader"
import CheckEmailVerificationCodeForm from "./_components/check-email-verification-code-form"

export default async function Page() {
  const user = await getCurrentUser()

  if (user.emailVerifiedAt) {
    return redirect("/my")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Check your email for a verification code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckEmailVerificationCodeForm />
        </CardContent>
      </Card>
    </div>
  )
}
