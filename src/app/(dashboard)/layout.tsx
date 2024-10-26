import { PostHogIdentifyUser } from "~/components/analytics/posthog"
import { getCurrentUser } from "~/server/loader"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <main>
      <PostHogIdentifyUser user={user} />
      {children}
    </main>
  )
}
