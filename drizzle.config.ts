import { defineConfig } from "drizzle-kit"
import env from "~/shared/env.server"

// For drizzle-kit to work locally, we use have installed `pg` so it'll be used as the
// driver. Otherwise, it will use try to use `@neondatabase/serverless`, which
// won't work locally since it won't be configured to use the websocket proxy.

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./migrations",
  breakpoints: true,
  verbose: true,
  strict: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  casing: "snake_case",
})
