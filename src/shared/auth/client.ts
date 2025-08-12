import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import env from "~/shared/env"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_CONVEX_URL,
  plugins: [convexClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
