import { createEnv } from "@t3-oss/env-core"
import { vercel } from "@t3-oss/env-core/presets-zod"
import * as z from "~/shared/utils/schema"

export default createEnv({
  server: {
    // Email Configuration
    EMAIL_FROM: z.email(),
    RESEND_API_KEY: z.string(),
    MOCK_RESEND: z.stringbool().default(false),

    // OAuth Configuration
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Authentication Configuration
    AUTH_PASSWORD: z.stringbool().default(true),
    AUTH_SIGN_IN_CODES: z.stringbool().default(true),
    AUTH_OAUTH: z.stringbool().default(true),
  },

  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.string(),
    NEXT_PUBLIC_SITE_URL: z.string(),
  },

  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  clientPrefix: "NEXT_PUBLIC_",

  runtimeEnvStrict: {
    // Email
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MOCK_RESEND: process.env.MOCK_RESEND,

    // OAuth
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // Authentication
    AUTH_PASSWORD: process.env.AUTH_PASSWORD,
    AUTH_SIGN_IN_CODES: process.env.AUTH_SIGN_IN_CODES,
    AUTH_OAUTH: process.env.AUTH_OAUTH,

    // Client
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV ?? "development",
  },

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",

  extends: [vercel()],
})
