import * as Sentry from "@sentry/nextjs"
import { OAuth2RequestError } from "arctic"
import chalk from "chalk"
import { StatusCodes } from "http-status-codes"
import ky from "ky"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseError } from "~/lib/error"

import { google } from "~/lib/auth/oauth"
import { setSession } from "~/lib/auth/session"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { logActivity } from "~/lib/logger"
import { GoogleUserSchema } from "~/lib/validation/external"
import { createOrganization } from "~/server/data/organization"
import {
  createProfile,
  createUserFromGoogle,
  findUserByGoogleId,
  markUserAsEmailVerified,
} from "~/server/data/user"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
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

    const data = await ky
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
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
      await logActivity("signed_in_with_google", { userId: existingUser.id })

      if (!existingUser.emailVerifiedAt && googleUser.email_verified) {
        await markUserAsEmailVerified(existingUser.id)
        await logActivity("marked_email_as_verified", {
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

    await logActivity("signed_up_with_google", { userId: user.id })

    await createProfile(user.id, {
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      preferredLocale: googleUser.locale,
    })

    const organization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: user.id },
    )

    await logActivity("created_organization", {
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
      console.info(chalk.red("❌ Invalid code provided by Google"))
      console.error(e)

      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    if (e instanceof DatabaseError) {
      console.info(
        chalk.red("💾 Encountered error while saving to the database"),
      )
      console.error(e)

      return new NextResponse(null, {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new NextResponse(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })
  }
}
