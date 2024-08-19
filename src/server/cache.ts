import "server-only"

import env from "@/lib/env.server"

import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis
