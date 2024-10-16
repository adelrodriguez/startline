import { vercel } from "@t3-oss/env-core/presets"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"
import { environment, isProduction } from "./vars"

export default createEnv({
  server: {
    DATABASE_URL: z.string(),

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

    // S3
    S3_ACCESS_KEY: z.string(),
    S3_SECRET: z.string(),
    S3_ENDPOINT: z.string(),
    S3_REGION: z.string().default("auto"),

    // Sentry
    SENTRY_DSN: z.string(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),
    SENTRY_AUTH_TOKEN: z.string(),

    // Stripe
    STRIPE_SECRET_KEY: z
      .string()
      .refine(
        (v) =>
          isProduction ? v.startsWith("sk_live") : v.startsWith("sk_test"),
        `Must start with ${isProduction ? "sk_live" : "sk_test"} in ${environment}`,
      ),
    STRIPE_WEBHOOK_SECRET: z.string(),

    // Upstash
    UPSTASH_REDIS_REST_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),

    // Uploadthing
    UPLOADTHING_TOKEN: z.string(),

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

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",

  emptyStringAsUndefined: process.env.NODE_ENV === "production",
  extends: [vercel()],
})
