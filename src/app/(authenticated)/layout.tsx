import { redirect } from "next/navigation"
import { getCurrentUser } from "~/features/auth/loaders"
import { UNAUTHORIZED_PATHNAME } from "~/shared/constants"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(UNAUTHORIZED_PATHNAME)
  }

  return <>{children}</>
}
