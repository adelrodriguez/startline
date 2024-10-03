import { OAuth2RequestError } from "arctic"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { google, setSession } from "~/lib/auth"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { logActivity } from "~/lib/logger"
import { GoogleUserSchema } from "~/lib/validation/external"
import { createOrganization } from "~/server/data/organization"
import {
  createProfile,
  createUserFromGoogle,
  findUserByGoogleId,
  markUserAsEmailVerified,
  UserId,
} from "~/server/data/user"

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
      const userId = UserId.parse(existingUser.id)

      if (!existingUser.emailVerifiedAt && googleUser.email_verified) {
        await markUserAsEmailVerified(userId)
      }

      await logActivity("signed_in_with_google", { userId })

      await setSession(userId)

      return new NextResponse(null, {
        status: StatusCodes.MOVED_TEMPORARILY,
        headers: {
          Location: AUTHORIZED_URL,
        },
      })
    }

    // If the user has not verified their email with Google, we cannot create
    // the user due to security concerns.
    if (!googleUser.email_verified) {
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const user = await createUserFromGoogle({
      googleId: googleUser.sub,
      email: googleUser.email,
      emailVerifiedAt: new Date(),
    })

    const userId = UserId.parse(user.id)

    await createProfile(userId, {
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      preferredLocale: googleUser.locale,
    })

    await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: userId },
    )

    await setSession(userId)

    return new NextResponse(null, {
      status: StatusCodes.MOVED_TEMPORARILY,
      headers: {
        Location: AUTHORIZED_URL,
      },
    })
  } catch (e) {
    console.error(e)
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
