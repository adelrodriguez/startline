import { headers } from "next/headers"

const FALLBACK_IP = "127.0.0.1"

export function getIpAddress(): string {
  const forwardedFor = headers().get("x-forwarded-for")
  const realIp = headers().get("x-real-ip")

  const forwardedForIp = forwardedFor?.split(",")[0]?.trim()

  if (forwardedForIp) return forwardedForIp

  if (realIp) return realIp.trim()

  console.warn("No IP address found, using fallback")

  return FALLBACK_IP
}
