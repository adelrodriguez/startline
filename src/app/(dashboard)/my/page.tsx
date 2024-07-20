import { signOut } from "@/server/actions"

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>

      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
    </div>
  )
}
