import { generateState } from "arctic"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { github } from "~/lib/auth/oauth"
import env from "~/lib/env.server"

export async function GET(): Promise<NextResponse> {
  if (!env.AUTH_OAUTH) {
    return NextResponse.json(
      { error: "OAuth authentication is disabled" },
      { status: StatusCodes.FORBIDDEN },
    )
  }

  const state = generateState()
  const url = await github.createAuthorizationURL(state)

  const cookieStore = await cookies()
  cookieStore.set("github_oauth_state", state, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // Ten minutes
  })

  return NextResponse.redirect(url)
}
