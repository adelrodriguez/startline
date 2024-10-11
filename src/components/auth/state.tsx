import { getCurrentSession } from "~/lib/auth/session"

export async function SignedIn({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession()

  if (!user) return null

  return <>{children}</>
}

export async function SignedOut({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession()

  if (user) return null

  return <>{children}</>
}
