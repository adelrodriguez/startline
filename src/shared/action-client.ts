import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { after } from "next/server"
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"
import z from "zod"
import { type Auth, AuthError, createAuth } from "~/shared/auth/server"
import { type Logger, logger } from "~/shared/logger"
import type { GenericCtx } from "~~/convex/_generated/server"

type ActionErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_SUPPORTED"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNPROCESSABLE_CONTENT"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT"

type ActionContext = {
  auth: Auth
  logger: Logger
}

export class ActionError extends Error {
  code: ActionErrorCode
  metadata?: Record<string, unknown>
  publicMessage?: string

  constructor({
    cause,
    code,
    message,
    metadata,
    publicMessage,
  }: {
    message: string
    /**
     * The public message to display to the client. If not provided, the
     * default server error message will be used.
     */
    publicMessage?: string
    code?: ActionErrorCode
    cause?: unknown
    metadata?: Record<string, unknown>
  }) {
    super(message, { cause })
    this.code = code ?? "INTERNAL_SERVER_ERROR"
    this.metadata = metadata
    this.name = "ActionError"
    this.publicMessage = publicMessage
  }
}

export const publicAction = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      name: z.string(),
    }),
  handleServerError(e) {
    if (e instanceof AuthError) {
      return e.message
    }

    if (e instanceof ActionError && e.publicMessage) {
      // If the error is an ActionError, return the public message
      return e.publicMessage
    }

    // Otherwise, return the default server error message, since we can't trust
    // that the error message is safe to display to the client
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})
  .use(async ({ next, metadata }) =>
    next({
      ctx: {
        auth: createAuth({} as GenericCtx),
        logger: logger.child({ actionName: metadata.name, metadata }),
      } satisfies ActionContext,
    })
  )
  // Logging middleware for action
  .use(async ({ next, metadata, ctx }) => {
    const startTime = performance.now()
    const result = await next()
    const duration = performance.now() - startTime

    // Don't block the response while we log the action result
    after(async () => {
      const headersList = await headers()
      const [ip, geo] = await Promise.all([
        ipAddress({ headers: headersList }),
        geolocation({ headers: headersList }),
      ])
      const formattedDuration = `${duration.toFixed(2)}ms`

      const context = { metadata, duration, ip, geo }

      if (result.success || result.navigationKind === "redirect") {
        // Navigation redirects are considered successful
        ctx.logger.info(
          context,
          `[Action] [${metadata.name}] Succeeded in ${formattedDuration}`
        )

        return
      }

      ctx.logger.error(
        {
          ...context,
          errors: {
            server: result.serverError,
            validation: result.validationErrors,
          },
        },
        `[Action] [${metadata.name}] Failed in ${formattedDuration}`
      )
    })

    return result
  })

// export const protectedAction = publicAction.use(async ({ next }) => {
//   const { session, user } = await validateRequest()

//   if (!session) {
//     throw new AuthError("Session not found")
//   }

//   return next({ ctx: { session, user } })
// })
