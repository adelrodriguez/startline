import { redirect } from "next/navigation"
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"
import { validateRequest } from "~/lib/auth/session"
import { UNAUTHORIZED_URL } from "~/lib/consts"
import { AuthError, OrganizationError, RateLimitError } from "~/lib/error"
import { type Logger, logger } from "~/lib/logger"
import { ActionMetadataSchema } from "~/lib/validation/actions"
import type { Session, User } from "~/server/data/user"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => ActionMetadataSchema,
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
