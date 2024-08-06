"server-only"

import env from "@/lib/env.server"
import { isProduction } from "@/lib/vars"
import db, { type User, type SessionValues, type UserRole } from "@/server/db"
import { session, user } from "@/server/db"
import { buildUrl } from "@/utils/url"
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import { GitHub, Google } from "arctic"
import { Lucia } from "lucia"
import type { User as AuthUser, Session } from "lucia"
import { cookies } from "next/headers"
import { cache } from "react"

const adapter = new DrizzleSQLiteAdapter(db, session, user)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: isProduction,
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    role: attributes.role,
  }),
})

interface DatabaseUserAttributes {
  email: string
  role: UserRole
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    UserId: number
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

export async function setSession(
  userId: User["id"],
  { ipAddress }: Pick<SessionValues, "ipAddress"> = {},
) {
  const session = await lucia.createSession(userId, { ipAddress })
  const sessionCookie = await lucia.createSessionCookie(session.id)

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
}

export async function invalidateSession(session: Session) {
  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
}

export async function invalidateAllSessions(userId: AuthUser["id"]) {
  await lucia.invalidateUserSessions(userId)
}

export const validateRequest = cache(
  async (): Promise<
    { user: AuthUser; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null

    if (!sessionId) {
      return { user: null, session: null }
    }

    const result = await lucia.validateSession(sessionId)

    try {
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
      }

      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
      }
    } catch {}

    return result
  },
)
export type { AuthUser }

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  buildUrl("/api/sign-in/google/callback"),
)

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)
