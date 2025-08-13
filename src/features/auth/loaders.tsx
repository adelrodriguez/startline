import { getToken } from "@convex-dev/better-auth/nextjs"
import { fetchQuery } from "convex/nextjs"
import { createAuth } from "~/shared/auth/server"
import { api } from "~~/convex/_generated/api"

export async function getCurrentUser() {
  const token = await getToken(createAuth)
  const user = await fetchQuery(api.auth.getCurrentUser, {}, { token })

  return user
}
