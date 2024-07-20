import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  client: {
    // Sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
