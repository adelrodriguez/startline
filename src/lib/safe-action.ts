import * as Sentry from "@sentry/nextjs"
import type { Logger } from "next-axiom"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { redirect } from "next/navigation"

import { validateRequest } from "~/lib/auth/session"
import { UNAUTHORIZED_URL } from "~/lib/consts"
import { AuthError, OrganizationError, RateLimitError } from "~/lib/error"
import { createActionLogger } from "~/lib/logger"
import { rateLimitByIp, rateLimitByUser } from "~/lib/rate-limit"
import { ActionMetadataSchema } from "~/lib/validation/actions"
import type { Session, User } from "~/server/data/user"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => ActionMetadataSchema,
  handleServerError(e, utils) {
    const ctx = utils.ctx as { log: Logger; user?: User; session?: Session }

    const sentryId = Sentry.captureException(e)

    ctx.log.error(e.message, {
      sentryId,
      userId: ctx.user?.id.toString(),
      sessionId: ctx.session?.id.toString(),
    })

    if (e instanceof OrganizationError) {
      return e.message
    }

    if (e instanceof AuthError) {
      redirect(UNAUTHORIZED_URL)
    }

    if (e instanceof RateLimitError) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
}).use(async ({ next, metadata }) => {
  const logger = createActionLogger(metadata)

  const result = await next({ ctx: { log: logger.log } })

  logger.flush(result.success)

  return result
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
