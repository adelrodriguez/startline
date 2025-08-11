import "server-only"

import { Redis } from "@upstash/redis"
import env from "~/lib/env.server"

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis
