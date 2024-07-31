import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ephemeralCache = new Map<string, number>()

const rateLimit = {
  user: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    analytics: true,
    ephemeralCache,
    prefix: "ratelimit:user",
    enableProtection: true,
  }),
  unknown: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    ephemeralCache,
    prefix: "ratelimit:unknown",
    enableProtection: true,
  }),
}

export default rateLimit
