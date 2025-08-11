import { validateRequest } from "~/shared/auth/server"

export async function AdminOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest()

  if (user?.role !== "admin") {
    return null
  }

  return <>{children}</>
}

export async function UserOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest()

  if (user?.role !== "user") {
    return null
  }

  return <>{children}</>
}
