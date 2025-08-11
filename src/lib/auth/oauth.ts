import { GitHub, Google } from "arctic"
import env from "~/lib/env.server"
import { buildUrl } from "~/utils/url"

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  buildUrl("/api/auth/google/callback")
)

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  buildUrl("/api/auth/github/callback")
)
