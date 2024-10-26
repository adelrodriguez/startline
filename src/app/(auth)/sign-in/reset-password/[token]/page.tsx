import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import NewPasswordForm from "./_components/new-password-form"

export default async function Page({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  )
}
