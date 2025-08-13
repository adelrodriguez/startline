import { createEnv } from "@t3-oss/env-core"
import { vercel } from "@t3-oss/env-core/presets-zod"
import * as z from "~/shared/utils/schema"

export default createEnv({
  server: {
    // Resend
    EMAIL_FROM: z.email(),
    MOCK_RESEND: z.stringbool().default(false),
    RESEND_API_KEY: z.string(),
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

  // We require all environment variables to be set so we can support both
  // Next.js and Convex's runtimes
  runtimeEnvStrict: {
    EMAIL_FROM: process.env.EMAIL_FROM,
    MOCK_RESEND: process.env.MOCK_RESEND,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV ?? "development",
  },

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",

  extends: [vercel()],
})
