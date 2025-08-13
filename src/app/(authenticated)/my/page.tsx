"use client"

import { useSession } from "~/shared/auth/client"

export default function Page() {
  const { data } = useSession()
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
