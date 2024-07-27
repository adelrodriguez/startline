import { getCurrentUser } from "@/server/loader"
import { redirect } from "next/navigation"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  if (!user.emailVerifiedAt) {
    return redirect("/verify")
  }

  return <>{children}</>
}
