import { validateRequest } from "@/lib/auth"
import { AUTHORIZED_URL } from "@/lib/consts"
import { redirect } from "next/navigation"

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
