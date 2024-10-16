import { getRandomValues } from "node:crypto"
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import { addDays, subDays } from "date-fns"
import { StatusCodes } from "http-status-codes"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { cache } from "react"
import { SESSION_COOKIE_NAME, SESSION_LENGTH_IN_DAYS } from "~/lib/consts"
import { isProduction } from "~/lib/vars"
import {
  type Session,
  SessionId,
  type User,
  type UserId,
  createSession,
  deleteSession,
  deleteSessions,
  findSessionById,
  updateSession,
} from "~/server/data/user"
import { sha } from "~/utils/hash"
import { getGeolocation, getIpAddress } from "~/utils/headers"

function generateSessionToken(): string {
  const bytes = new Uint8Array(20)

  getRandomValues(bytes)

  const token = encodeBase32LowerCaseNoPadding(bytes)

  return token
}

async function validateSessionToken(
  token: string,
): Promise<{ session: Session; user: User } | { session: null; user: null }> {
  const sessionId = SessionId.parse(sha.sha256.hash(token))

  const session = await findSessionById(sessionId)

  if (!session) return { session: null, user: null }

  if (Date.now() >= session.expiresAt.getTime()) {
    await deleteSession(sessionId)

    return { session: null, user: null }
  }

  // If the session is expiring before the halfway point, refresh it
  if (
    Date.now() >=
    subDays(session.expiresAt, SESSION_LENGTH_IN_DAYS / 2).getTime()
  ) {
    await updateSession(sessionId, {
      expiresAt: addDays(new Date(), SESSION_LENGTH_IN_DAYS),
    })
  }

  return { session, user: session.user }
}

function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    expires: expiresAt,
    path: "/",
  })
}

export function deleteSessionTokenCookie(): void {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  })
}

export async function setSession(userId: UserId, request?: Request) {
  const token = generateSessionToken()
  const ipAddress = getIpAddress(request)
  const geolocation = getGeolocation(request)

  const session = await createSession(token, userId, {
    ipAddress,
    country: geolocation?.country,
    region: geolocation?.region,
    city: geolocation?.city,
  })

  setSessionTokenCookie(token, session.expiresAt)

  return session
}

export async function invalidateSession(sessionId: SessionId): Promise<void> {
  await deleteSession(sessionId)
}

export async function invalidateAllSessions(userId: UserId): Promise<void> {
  await deleteSessions(userId)
}

export const getCurrentSession = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value ?? null

    if (!sessionId) {
      return { user: null, session: null }
    }

    const result = await validateSessionToken(sessionId)

    return result
  },
)

type ProtectedRouteHandler = (
  request: NextRequest,
  user: User,
  params: Record<string, string> | undefined,
) => Promise<NextResponse> | NextResponse

export function protectedRoute(handler: ProtectedRouteHandler) {
  return async (request: NextRequest, params?: Record<string, string>) => {
    const { user, session } = await getCurrentSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      )
    }

    return handler(request, user, params)
  }
}
