import { vercel } from "@t3-oss/env-core/presets"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

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

    // Node
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Resend
    RESEND_API_KEY: z.string(),

    // Authentication methods
    AUTH_PASSWORD: z.preprocess(
      (v) => v === "true",
      z.boolean().default(false)
    ),
    AUTH_SIGN_IN_CODES: z.preprocess(
      (v) => v === "true",
      z.boolean().default(false)
    ),
    AUTH_OAUTH: z.preprocess((v) => v === "true", z.boolean().default(false)),
  },
  
  client: {
    NEXT_PUBLIC_DOMAIN: z.string(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",

  emptyStringAsUndefined: process.env.NODE_ENV === "production",
  extends: [vercel()],
})