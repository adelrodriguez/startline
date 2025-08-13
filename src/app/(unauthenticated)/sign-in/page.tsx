import Link from "next/link"
import SignInWithPasswordForm from "~/features/auth/components/sign-in-with-password-form"
// import {
//   SignInWithGitHubButton,
//   SignInWithGoogleButton,
// } from "~/features/auth/components/sign-in-with-social-buttons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card"
import { Separator } from "~/shared/components/ui/separator"

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <Card className="w-full sm:mx-auto sm:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <SignInWithCodeForm /> */}

          <div className="relative my-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator decorative />
            </div>
            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SignInWithPasswordForm />

          <div className="relative my-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <Separator decorative />
            </div>

            <div className="relative flex justify-center font-medium text-sm leading-6">
              <span className="bg-background px-6 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {/* <SignInWithGoogleButton className="w-full min-w-[180px] sm:flex-1" />
                <SignInWithGitHubButton className="w-full min-w-[180px] sm:flex-1" /> */}
          </div>

          <div className="mt-8 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
              href="/sign-up"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
