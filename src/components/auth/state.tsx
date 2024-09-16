import { validateRequest } from "~/lib/auth"

export async function SignedIn({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest()

  if (!user) return null

  return <>{children}</>
}

export async function SignedOut({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest()

  if (user) return null

  return <>{children}</>
}
