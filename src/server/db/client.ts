import { neonConfig, Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import env from "~/lib/env.server"
import { isDevelopment } from "~/lib/vars"
import * as schema from "./schema"

neonConfig.webSocketConstructor = ws

if (isDevelopment) {
  neonConfig.wsProxy = (host) => `${host}:54330/v1`
  // Disable all authentication and encryption
  neonConfig.useSecureWebSocket = false
  neonConfig.pipelineTLS = false
  neonConfig.pipelineConnect = false
}

const pool = new Pool({ connectionString: env.DATABASE_URL })
const db = drizzle(pool, { schema, casing: "snake_case" })

export default db
