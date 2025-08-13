import { convexAdapter } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth"
import type { GenericCtx } from "~~/convex/_generated/server"
import { betterAuthComponent } from "~~/convex/auth"
import env from "~~/src/shared/env"

export function createAuth(ctx: GenericCtx) {
  return betterAuth({
    trustedOrigins: [env.NEXT_PUBLIC_SITE_URL],
    database: convexAdapter(ctx, betterAuthComponent),

    // Simple non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required
      convex(),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>

export { APIError as AuthError } from "better-auth/api"
