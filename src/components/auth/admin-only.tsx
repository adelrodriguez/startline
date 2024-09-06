import { validateRequest } from "~/lib/auth"

export default async function AdminOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest()

  if (user?.role !== "admin") {
    return null
  }

  return <>{children}</>
}
