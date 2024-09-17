import { OAuth2RequestError } from "arctic"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { github, setSession } from "~/lib/auth"
import { AUTHORIZED_URL, DEFAULT_ORGANIZATION_NAME } from "~/lib/consts"
import { GitHubUserSchema } from "~/lib/validation/external"
import { createOrganization, OrganizationId } from "~/server/data/organization"
import {
  createProfile,
  createUserFromGitHub,
  findUserByGitHubId,
  markUserAsEmailVerified,
  UserId,
} from "~/server/data/user"
import { logActivity } from "~/lib/logger"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies().get("github_oauth_state")?.value ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new NextResponse(null, {
      status: StatusCodes.BAD_REQUEST,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    const data = await response.json()

    const result = await GitHubUserSchema.safeParse(data)

    if (!result.success) {
      return new NextResponse(null, {
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const githubUser = result.data

    const existingUser = await findUserByGitHubId(githubUser.id)

    if (existingUser) {
      const userId = UserId.parse(existingUser.id)

      if (!existingUser.emailVerifiedAt) {
        await Promise.all([
          markUserAsEmailVerified(userId),
          logActivity("verified_email", { userId }),
        ])
      }

      await logActivity("signed_in_with_github", { userId })

      await setSession(userId)

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

    const userId = UserId.parse(user.id)

    await Promise.all([
      createProfile(userId, { name: githubUser.name }),
      logActivity("signed_up_with_github", { userId }),
    ])

    const newOrganization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: userId },
    )

    const organizationId = OrganizationId.parse(newOrganization.id)

    await logActivity("created_organization", { userId, organizationId })

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
