import env from "@/lib/env.server"
import { remember } from "@epic-web/remember"
import { Redis } from "@upstash/redis"

const redis = remember(
  "redis",
  () =>
    new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
)

export default redis
