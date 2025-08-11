import "server-only"

import { geolocation, ipAddress, waitUntil } from "@vercel/functions"
import { StatusCodes } from "http-status-codes"
import type { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { Logger, LogLevel } from "next-axiom"
import type { ActionMetadata } from "~/lib/validation/actions"
import { getGeolocation, getIpAddress } from "~/utils/headers"

/**
 * Log requests in the middleware
 */
export function middlewareLogger(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: "middleware" })
  logger.middleware(request)
  event.waitUntil(logger.flush())
}

export function createActionLogger(metadata: ActionMetadata) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  const logger = new Logger({
    source: "action",
    req: { requestId, actionName: metadata.actionName },
  })
  const log = logger.with({})
  log.config.source = "action-log"

  return {
    log,
    flush: async (success: boolean) => {
      const endTime = Date.now()
      const ipAddress = await getIpAddress()
      const geolocation = await getGeolocation()

      const report = {
        metadata,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        requestId,
        ip: ipAddress,
        ...geolocation,
      }

      logger.logHttpRequest(
        success ? LogLevel.info : LogLevel.error,
        `Action "${metadata.actionName}" ${success ? "succeeded" : "failed"} in ${report.durationMs}ms`,
        report,
        {}
      )

      logger.config.req = report

      waitUntil(log.flush())
    },
  }
}

export function createRequestLogger(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const isEdge = !!globalThis.EdgeRuntime

  const logger = new Logger({
    source: isEdge ? "edge" : "lambda",
    req: {
      path: request.nextUrl.pathname,
      host: request.headers.get("host"),
      requestId,
    },
  })

  const log = logger.with({})
  log.config.source = isEdge ? "edge-log" : "lambda-log"

  return {
    log,
    flush: (logLevel: LogLevel, statusCode: StatusCodes) => {
      const endTime = Date.now()
      const report = {
        startTime,
        endTime,
        durationMs: endTime - startTime,
        path: request.nextUrl.pathname,
        method: request.method,
        host: request.headers.get("host"),
        userAgent: request.headers.get("user-agent"),
        scheme: request.nextUrl.protocol,
        requestId,
        ip: ipAddress(request),
        ...geolocation(request),
      }

      logger.logHttpRequest(
        logLevel,
        `[${request.method}] ${report.path} ${statusCode} ${report.durationMs}ms`,
        report,
        {}
      )

      logger.config.req = report
      log.attachResponseStatus(statusCode)

      waitUntil(log.flush())
    },
  }
}

type NextRequestWithLogger = NextRequest & {
  log: Logger
}
type HandlerWithLogger = (
  request: NextRequestWithLogger,
  args: { params?: Promise<Record<string, string>> }
) => Promise<Response> | Promise<NextResponse> | NextResponse | Response

export function withLogger(handler: HandlerWithLogger) {
  return async (
    request: NextRequest,
    args: { params?: Promise<Record<string, string>> }
  ) => {
    const logger = createRequestLogger(request)

    const modifiedRequest = request as NextRequestWithLogger
    modifiedRequest.log = logger.log

    try {
      const response = await handler(modifiedRequest, args)

      // Flush the logger (with child loggers)
      logger.flush(
        response.status >= 400 ? LogLevel.error : LogLevel.info,
        response.status
      )

      return response

      // Log if we reach an unhandled error
    } catch (error) {
      logger.flush(LogLevel.error, StatusCodes.INTERNAL_SERVER_ERROR)

      throw error
    }
  }
}
