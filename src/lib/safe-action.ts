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
import { type AuthUser, validateRequest } from "~/lib/auth"
import { FALLBACK_IP, UNAUTHORIZED_URL } from "~/lib/consts"
import rateLimiter from "~/lib/rate-limit"
import { AuthError, RateLimitError } from "~/utils/error"
import { getIpAddress } from "~/utils/headers"
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

export const rateLimitByIp = createMiddleware().define(
  async ({ next, ctx }) => {
    const ipAddress = getIpAddress() ?? FALLBACK_IP

    const limit = await rateLimiter.unknown.limit(ipAddress)

    if (!limit.success) {
      throw new RateLimitError("Too many requests")
    }

    return next({ ctx })
  },
)

export const rateLimitByUser = createMiddleware<{
  ctx: { user: AuthUser }
}>().define(async ({ next, ctx }) => {
  const limit = await rateLimiter.user.limit(ctx.user.email)

  if (!limit.success) {
    throw new RateLimitError("Rate limit exceeded")
  }

  return next({ ctx })
})
