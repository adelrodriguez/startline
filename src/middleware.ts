import { nextIntlMiddleware } from "@/server/middlewares"
import type { MiddlewareConfig } from "next/server"

export const middleware = nextIntlMiddleware

export const config: MiddlewareConfig = {
  matcher: ["/(en|es)/:path*"],
}
