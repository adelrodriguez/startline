import { vercel } from "@t3-oss/env-core/presets"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  server: {
    EMAIL_FROM: z.email(),

    // Node
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Resend
    MOCK_RESEND: z.preprocess((v) => v === "true", z.boolean().default(false)),
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
    NEXT_PUBLIC_CONVEX_URL: z.string(),
    NEXT_PUBLIC_DOMAIN: z.string(),
    NEXT_PUBLIC_SITE_URL: z.string(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",

  emptyStringAsUndefined: process.env.NODE_ENV === "production",
  extends: [vercel()],
})
