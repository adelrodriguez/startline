import { validateRequest } from "@/lib/auth"

export default async function SignedIn({
  children,
}: { children: React.ReactNode }) {
  const { user } = await validateRequest()

  if (!user) return null

  return <>{children}</>
}
