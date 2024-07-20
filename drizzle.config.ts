import env from "@/lib/env.server"
import type { Config } from "drizzle-kit"

export default {
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  driver: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  dialect: "sqlite",
} satisfies Config
