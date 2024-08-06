import { nextIntlMiddleware } from "@/server/middlewares"
import type { MiddlewareConfig } from "next/server"

// TODO(adelrodriguez): Add way to stack middlewares
export const middleware = nextIntlMiddleware

export const config: MiddlewareConfig = {
  matcher: ["/(en|es)/:path*"],
}
