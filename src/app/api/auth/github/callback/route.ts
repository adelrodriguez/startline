import * as Sentry from "@sentry/nextjs"
import { ArcticFetchError, OAuth2RequestError } from "arctic"
import { StatusCodes } from "http-status-codes"
import ky from "ky"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { github } from "~/lib/auth/oauth"
import { setSession } from "~/lib/auth/session"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { DatabaseError } from "~/lib/error"
import { withLogger } from "~/lib/logger"
import { GitHubUserSchema } from "~/lib/validation/external"
import { createActivityLog } from "~/server/data/activity-log"
import { createOrganization } from "~/server/data/organization"
import {
  createUserFromGitHub,
  findUserByGitHubId,
  markUserAsEmailVerified,
  upsertProfile,
} from "~/server/data/user"

export const GET = withLogger(async (request) => {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("github_oauth_state")?.value ?? null

  if (!(code && state && storedState) || state !== storedState) {
    return new NextResponse(null, {
      status: StatusCodes.BAD_REQUEST,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const accessToken = tokens.accessToken()

    const data = await ky
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .json()

    const result = GitHubUserSchema.safeParse(data)

    if (!result.success) {
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const githubUser = result.data

    const existingUser = await findUserByGitHubId(githubUser.id)

    if (existingUser) {
      await createActivityLog("signed_in_with_github", {
        userId: existingUser.id,
      })

      if (!existingUser.emailVerifiedAt) {
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

    const user = await createUserFromGitHub({
      githubId: githubUser.id,
      email: githubUser.email,
    })

    await createActivityLog("signed_up_with_github", { userId: user.id })

    await upsertProfile(user.id, {
      name: githubUser.name,
      avatarUrl: githubUser.avatar_url,
    })

    const organization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: user.id }
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
      request.log.error("❌ Invalid code provided by GitHub", e)

      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    if (e instanceof ArcticFetchError) {
      request.log.error("❌ Failed to fetch user from GitHub", e)

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
      "Encountered an unknown error while handling a GitHub OAuth callback",
      e as Error
    )

    return new NextResponse(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })
  }
})
