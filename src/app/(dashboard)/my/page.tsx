import { AdminOnly } from "@/components/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormSubmit,
  TypographySmall,
} from "@/components/ui"
import { signOut } from "@/server/actions"
import { getCurrentUser, getFirstOrganization } from "@/server/loader"
import { Loader2Icon } from "lucide-react"
import InviteMemberForm from "./_components/invite-member-form"

export default async function Page() {
  const user = await getCurrentUser()
  const organization = await getFirstOrganization()

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              You are a member of {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
            <div>
              <InviteMemberForm organizationId={organization.id} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <AdminOnly>
              <TypographySmall>Only admins can see this</TypographySmall>
            </AdminOnly>
            <form action={signOut}>
              <FormSubmit
                variant="outline"
                className="w-full"
                renderLoading={
                  <>
                    <Loader2Icon
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
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
