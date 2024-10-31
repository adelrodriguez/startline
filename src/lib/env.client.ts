import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  client: {
    NEXT_PUBLIC_DOMAIN: z.string(),
    NEXT_PUBLIC_ASSETS_DOMAIN: z.string(),

    // Axiom
    NEXT_PUBLIC_AXIOM_TOKEN: z.string(),
    NEXT_PUBLIC_AXIOM_DATASET: z.string(),

    // PostHog
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string(),

    // Sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_ASSETS_DOMAIN: process.env.NEXT_PUBLIC_ASSETS_DOMAIN,
    NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
    NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
})
