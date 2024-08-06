import { PostHogIdentifyUser } from "@/components/analytics"
import { signOut } from "@/server/actions"
import { getCurrentUser } from "@/server/loader"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <main>
      <PostHogIdentifyUser user={user} />
      <div className="flex justify-between">
        You are signed in as {user.email}
        <form action={signOut}>
          <button type="submit">Sign Out</button>
        </form>
      </div>
      {children}
    </main>
  )
}
