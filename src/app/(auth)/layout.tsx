import { redirect } from "next/navigation"
import { validateRequest } from "~/lib/auth/session"
import { AUTHORIZED_URL } from "~/lib/consts"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await validateRequest()

  if (user) {
    return redirect(AUTHORIZED_URL)
  }

  return <main>{children}</main>
}
