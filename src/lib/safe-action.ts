// We use safe actions in cases where we want to use server actions but we are
// not submitting a form. They provide better ergonomics and error handling for
// this specific cases.
//
// For forms, we use the Conform library, which provides form validation both on
// server and client plus handling form state.

import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { redirect } from "next/navigation"
import { validateRequest } from "~/lib/auth/session"
import { UNAUTHORIZED_URL } from "~/lib/consts"
import { AuthError, RateLimitError } from "~/lib/error"
import { rateLimitByIp, rateLimitByUser } from "~/lib/rate-limit"
import type { User } from "~/server/data/user"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error(e)

    if (e instanceof AuthError) {
      redirect(UNAUTHORIZED_URL)
    }

    if (e instanceof RateLimitError) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const { session, user } = await validateRequest()

  if (!session) {
    throw new AuthError("Session not found")
  }

  return next({ ctx: { session, user } })
})

export const withRateLimitByIp = createMiddleware().define(
  async ({ next, ctx }) => {
    await rateLimitByIp()

    return next({ ctx })
  },
)

export const withRateLimitByUser = createMiddleware<{
  ctx: { user: User }
}>().define(async ({ next, ctx }) => {
  await rateLimitByUser(ctx.user.email)

  return next({ ctx })
})
