import { redirect } from "next/navigation"
import { validateRequest } from "~/shared/auth/server"
import { AUTHORIZED_URL } from "~/shared/consts"

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
