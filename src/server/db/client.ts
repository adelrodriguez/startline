"server-only"

import env from "@/lib/env.server"
import * as schema from "@/server/db/schema"
import { remember } from "@epic-web/remember"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

const turso = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = remember("db", () => drizzle(turso, { schema }))

export default db
