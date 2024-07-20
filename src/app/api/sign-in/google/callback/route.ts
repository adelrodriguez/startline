import { google, setSession } from "@/lib/auth"
import { AUTHORIZED_URL } from "@/lib/consts"
import { createUserWithGoogle, findUserByGoogleId } from "@/server/data"
import { GoogleUserSchema } from "@/utils/validation"
import { OAuth2RequestError } from "arctic"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies().get("google_oauth_state")?.value ?? null
  const codeVerifier = cookies().get("google_code_verifier")?.value ?? null

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    return new NextResponse(null, {
      status: StatusCodes.BAD_REQUEST,
    })
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)

    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    )

    const data = await response.json()

    const result = await GoogleUserSchema.safeParse(data)

    if (!result.success) {
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const googleUser = result.data

    const existingUser = await findUserByGoogleId(googleUser.sub)

    if (existingUser) {
      await setSession(existingUser.id)

      return new NextResponse(null, {
        status: StatusCodes.MOVED_TEMPORARILY,
        headers: {
          Location: AUTHORIZED_URL,
        },
      })
    }

    const user = await createUserWithGoogle({
      googleId: googleUser.sub,
      email: googleUser.email,
      emailVerifiedAt: googleUser.email_verified ? new Date() : null,
    })

    await setSession(user.id)

    return new NextResponse(null, {
      status: StatusCodes.MOVED_TEMPORARILY,
      headers: {
        Location: AUTHORIZED_URL,
      },
    })
  } catch (e) {
    // The specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // Invalid code
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    return new NextResponse(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })
  }
}
