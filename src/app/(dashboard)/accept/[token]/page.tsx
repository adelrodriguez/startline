import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { getOrganizationFromInvitation } from "~/server/loader"

export default async function Page({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const organization = await getOrganizationFromInvitation(token)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-bold text-2xl text-gray-800">
            {organization.name}
          </CardTitle>
          <CardDescription>
            You've been invited to join {organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-gray-600">
            Please review the invitation and choose to accept or decline.
          </p>
        </CardContent>

        <CardFooter className="flex justify-between">
          <form>
            <Button variant="outline" type="submit">
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </form>
          <form>
            <Button type="submit" variant="default">
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
