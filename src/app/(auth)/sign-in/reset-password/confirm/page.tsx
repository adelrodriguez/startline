import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui"
import { RESET_PASSWORD_URL } from "~/lib/consts"

export default async function Page({
  searchParams,
}: { searchParams: Promise<{ to: string }> }) {
  const { to } = await searchParams

  if (!to) {
    redirect(RESET_PASSWORD_URL)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle>Password reset sent!</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="break-words">
            Sent a reset password email to{" "}
            <span className="font-semibold">{to}</span>.
          </p>
          <p>Please check your email.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
