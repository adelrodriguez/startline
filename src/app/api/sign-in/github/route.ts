import { github } from "@/lib/auth"
import { generateState } from "arctic"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(): Promise<NextResponse> {
  const state = generateState()
  const url = await github.createAuthorizationURL(state)

  cookies().set("github_oauth_state", state, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // Ten minutes
  })

  return NextResponse.redirect(url)
}
