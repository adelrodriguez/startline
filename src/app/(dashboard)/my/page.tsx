import { AdminOnly } from "~/components/auth/roles"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { TypographySmall } from "~/components/ui/typography"
import { OrganizationId } from "~/server/data/organization"
import { getCurrentUser, getFirstOrganization } from "~/server/loader"
import InviteMemberForm from "./_components/invite-member-form"
import SignOutButton from "./_components/sign-out-button"

export default async function Page() {
  const user = await getCurrentUser()
  const organization = await getFirstOrganization()
  const organizationId = OrganizationId.parse(organization.id)

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
              <InviteMemberForm organizationId={organizationId} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <AdminOnly>
              <TypographySmall>Only admins can see this</TypographySmall>
            </AdminOnly>
            <SignOutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
