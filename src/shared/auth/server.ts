import { convexAdapter } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth"
import env from "~/shared/env"
import type { GenericCtx } from "~~/convex/_generated/server"
import { betterAuthComponent } from "~~/convex/auth"

// TODO: Actually implement this
export async function validateRequest() {
  return (await Promise.resolve({
    user: null,
    session: null,
  })) as { user: User | null; session: Session | null }
}

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
