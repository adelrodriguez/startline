import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { waitUntil } from "@vercel/functions"
import { RateLimitError } from "~/lib/error"
import { getIpAddress } from "~/utils/headers"

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

type RateLimitOptions = Parameters<(typeof Ratelimit)["prototype"]["limit"]>[1]

export async function rateLimitByIp(options?: RateLimitOptions) {
  const ipAddress = getIpAddress()

  const limit = await rateLimit.unknown.limit(ipAddress ?? "unknown", {
    ...options,
    ip: ipAddress ?? undefined,
  })

  if (!limit.success) {
    throw new RateLimitError(`Too many requests for ${ipAddress}`)
  }

  waitUntil(limit.pending)
}

export async function rateLimitByUser(
  email: string,
  options?: RateLimitOptions,
) {
  const ipAddress = getIpAddress()

  const limit = await rateLimit.user.limit(email, {
    ...options,
    ip: ipAddress ?? undefined,
  })

  if (!limit.success) {
    throw new RateLimitError(`Too many requests for ${email}`)
  }

  waitUntil(limit.pending)
}

export default rateLimit
