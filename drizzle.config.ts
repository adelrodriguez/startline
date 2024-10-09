import { defineConfig } from "drizzle-kit"
import env from "~/lib/env.server"

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./migrations",
  breakpoints: true,
  verbose: true,
  strict: true,
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  dialect: "turso",
  casing: "snake_case",
})
