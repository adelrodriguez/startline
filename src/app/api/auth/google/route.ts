import { generateCodeVerifier, generateState } from "arctic"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { google } from "~/lib/auth/oauth"
import env from "~/lib/env.server"

export async function GET(): Promise<NextResponse> {
  if (!env.AUTH_OAUTH) {
    return NextResponse.json(
      { error: "OAuth authentication is disabled" },
      { status: StatusCodes.FORBIDDEN },
    )
  }

  const state = generateState()
  const scopes = ["openid", "profile", "email"]
  const codeVerifier = generateCodeVerifier()

  const url = google.createAuthorizationURL(state, codeVerifier, scopes)

  const cookieStore = await cookies()

  cookieStore.set("google_oauth_state", state, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // Ten minutes
  })

  cookieStore.set("google_code_verifier", codeVerifier, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // Ten minutes
  })

  return NextResponse.redirect(url)
}
