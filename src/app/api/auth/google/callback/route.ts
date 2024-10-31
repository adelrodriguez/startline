import * as Sentry from "@sentry/nextjs"
import { ArcticFetchError, OAuth2RequestError } from "arctic"
import { StatusCodes } from "http-status-codes"
import ky from "ky"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { DatabaseError } from "~/lib/error"

import { google } from "~/lib/auth/oauth"
import { setSession } from "~/lib/auth/session"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { withLogger } from "~/lib/logger"
import { GoogleUserSchema } from "~/lib/validation/external"
import { createActivityLog } from "~/server/data/activity-log"
import { createOrganization } from "~/server/data/organization"
import {
  createUserFromGoogle,
  findUserByGoogleId,
  markUserAsEmailVerified,
  upsertProfile,
} from "~/server/data/user"

export const GET = withLogger(async (request) => {
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")

  const cookieStore = await cookies()
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null

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
    const accessToken = tokens.accessToken()

    const data = await ky
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json()

    const result = GoogleUserSchema.safeParse(data)

    if (!result.success) {
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const googleUser = result.data

    const existingUser = await findUserByGoogleId(googleUser.sub)

    if (existingUser) {
      await createActivityLog("signed_in_with_google", {
        userId: existingUser.id,
      })

      if (!existingUser.emailVerifiedAt && googleUser.email_verified) {
        await markUserAsEmailVerified(existingUser.id)
        await createActivityLog("marked_email_as_verified", {
          userId: existingUser.id,
        })
      }

      await setSession(existingUser.id, request)

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
    })

    await createActivityLog("signed_up_with_google", { userId: user.id })

    await upsertProfile(user.id, {
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      preferredLocale: googleUser.locale,
    })

    const organization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: user.id },
    )

    await createActivityLog("created_organization", {
      userId: user.id,
      organizationId: organization.id,
    })

    await setSession(user.id, request)

    return new NextResponse(null, {
      status: StatusCodes.MOVED_TEMPORARILY,
      headers: {
        Location: AUTHORIZED_URL,
      },
    })
  } catch (e) {
    Sentry.captureException(e)

    // The specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      request.log.error("❌ Invalid code provided by Google", e)

      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    if (e instanceof ArcticFetchError) {
      request.log.error("❌ Failed to fetch user from Google", e)

      return new NextResponse(null, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    if (e instanceof DatabaseError) {
      request.log.error("💾 Encountered error while saving to the database", e)

      return new NextResponse(null, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    request.log.error(
      "Encountered an unknown error while handling a Google OAuth callback",
      e as Error,
    )

    return new NextResponse(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })
  }
})
