import { validateRequest } from "@/lib/auth"

export default async function UserOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest()

  if (user?.role !== "user") {
    return null
  }

  return <>{children}</>
}
