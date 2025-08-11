import { validateRequest } from "~/shared/auth/server"

export async function Authenticated({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  if (!user) {
    return null
  }

  return <>{children}</>
}

export async function Unauthenticated({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  if (user) {
    return null
  }

  return <>{children}</>
}
