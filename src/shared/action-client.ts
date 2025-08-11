import { redirect } from "next/navigation"
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"
import z from "zod"
import type { Session, User } from "~/server/data/user"
import { validateRequest } from "~/shared/auth/server"
import { UNAUTHORIZED_URL } from "~/shared/consts"
import { AuthError, OrganizationError, RateLimitError } from "~/shared/error"
import { type Logger, logger } from "~/shared/logger"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      actionName: z.string(),
    }),
  handleServerError(e, utils) {
    const ctx = utils.ctx as {
      log: Logger
      user?: User
      session?: Session
    }

    ctx.log.error(
      {
        userId: ctx.user?.id.toString(),
        sessionId: ctx.session?.id.toString(),
      },
      e.message
    )

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
}).use(async ({ next, metadata }) =>
  next({
    ctx: { log: logger.child({ actionName: metadata.actionName, metadata }) },
  })
)

export const authActionClient = actionClient.use(async ({ next }) => {
  const { session, user } = await validateRequest()

  if (!session) {
    throw new AuthError("Session not found")
  }

  return next({ ctx: { session, user } })
})
