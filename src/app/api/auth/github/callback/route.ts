import * as Sentry from "@sentry/nextjs"
import { OAuth2RequestError } from "arctic"
import chalk from "chalk"
import { StatusCodes } from "http-status-codes"
import ky from "ky"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

import { github } from "~/lib/auth/oauth"
import { setSession } from "~/lib/auth/session"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { DatabaseError } from "~/lib/error"
import { logActivity } from "~/lib/logger"
import { GitHubUserSchema } from "~/lib/validation/external"
import { createOrganization } from "~/server/data/organization"
import {
  createProfile,
  createUserFromGitHub,
  findUserByGitHubId,
  markUserAsEmailVerified,
} from "~/server/data/user"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("github_oauth_state")?.value ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new NextResponse(null, {
      status: StatusCodes.BAD_REQUEST,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)

    const data = await ky
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
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
      await logActivity("signed_in_with_github", { userId: existingUser.id })

      if (!existingUser.emailVerifiedAt) {
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

    const user = await createUserFromGitHub({
      githubId: githubUser.id,
      email: githubUser.email,
    })

    await logActivity("signed_up_with_github", { userId: user.id })

    await createProfile(user.id, {
      name: githubUser.name,
      avatarUrl: githubUser.avatar_url,
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
      console.info(chalk.red("❌ Invalid code provided by GitHub"))
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
