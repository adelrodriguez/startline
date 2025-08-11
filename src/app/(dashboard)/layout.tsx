import { getCurrentUser } from "~/server/loader"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await getCurrentUser()

  return children
}
