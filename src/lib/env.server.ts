import { uploadthing, vercel } from "@t3-oss/env-core/presets"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  server: {
    EMAIL_FROM: z.string().email(),

    // GitHub
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    // Google
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    // Mocks
    MOCK_RESEND: z.preprocess((v) => v === "true", z.boolean().default(false)),
    MOCK_QSTASH: z.preprocess((v) => v === "true", z.boolean().default(false)),

    // Node
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // QStash
    QSTASH_URL: z.string(),
    QSTASH_TOKEN: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),

    // Resend
    RESEND_API_KEY: z.string(),

    // Sentry
    SENTRY_DSN: z.string(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),

    // Stripe
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    // Turso
    DATABASE_URL: z.string(),
    DATABASE_AUTH_TOKEN: z.string(),

    // Upstash
    UPSTASH_REDIS_REST_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),

    // Authentication methods
    AUTH_PASSWORD: z.preprocess(
      (v) => v === "true",
      z.boolean().default(false),
    ),
    AUTH_SIGN_IN_CODES: z.preprocess(
      (v) => v === "true",
      z.boolean().default(false),
    ),
    AUTH_OAUTH: z.preprocess((v) => v === "true", z.boolean().default(false)),
  },
  experimental__runtimeEnv: process.env,
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
  extends: [vercel(), uploadthing()],
})
