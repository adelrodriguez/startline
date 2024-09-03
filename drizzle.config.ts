import env from "@/lib/env.server"
import type { Config } from "drizzle-kit"

export default {
  schema: "./src/server/db/schema/index.ts",
  out: "./migrations",
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  dialect: "sqlite",
} satisfies Config
