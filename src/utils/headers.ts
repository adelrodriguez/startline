import { headers } from "next/headers"

const fallBackIp = "127.0.0.1"

export function getIpAddress(): string {
  const forwardedFor = headers().get("x-forwarded-for")
  const realIp = headers().get("x-real-ip")

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? fallBackIp
  }

  if (realIp) {
    return realIp.trim()
  }

  return fallBackIp
}
