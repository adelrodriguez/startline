import { getCurrentUser } from "@/server/loader"

import { AdminOnly } from "@/components/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormSubmit,
  Icon,
  TypographySmall,
} from "@/components/ui"
import {} from "@/components/ui"
import { signOut } from "@/server/actions"

export default async function Page() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              You have successfully logged in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">John Doe</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <AdminOnly>
              <TypographySmall>Only admins can see this</TypographySmall>
            </AdminOnly>
            <form action={signOut}>
              <FormSubmit
                variant="outline"
                renderLoading={
                  <>
                    <Icon
                      name="loader-circle"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Signing out...
                  </>
                }
              >
                Sign out
              </FormSubmit>
            </form>
            <Button>View Profile</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
