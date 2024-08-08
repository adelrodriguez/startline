import { AdminOnly, UserOnly } from "@/components/auth"
import ClientTest from "./_components/client-test"

export default async function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <AdminOnly>
        <p>You are an admin</p>
      </AdminOnly>
      <UserOnly>
        <p>You are a user</p>
      </UserOnly>
      <ClientTest />
    </div>
  )
}
