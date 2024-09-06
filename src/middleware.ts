import type { MiddlewareConfig } from "next/server"
import { nextIntlMiddleware } from "~/server/middlewares"

export const middleware = nextIntlMiddleware

export const config: MiddlewareConfig = {
  matcher: ["/(en|es)/:path*"],
}
