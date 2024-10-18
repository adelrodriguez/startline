import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"

const FALLBACK_IP = "127.0.0.1"

export function getIpAddress(request?: Request): string | null {
  if (request) {
    const ip = ipAddress(request)

    if (!ip) {
      console.warn("No IP address found, using fallback")

      return FALLBACK_IP
    }

    return ip.trim()
  }

  const headersList = headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")

  const forwardedForIp = forwardedFor?.split(",")[0]?.trim()

  if (forwardedForIp) return forwardedForIp

  if (realIp) return realIp.trim()

  console.warn("No IP address found, using fallback")

  return FALLBACK_IP
}

export function getGeolocation(request?: Request): {
  country: string | null
  city: string | null
  region: string | null
} {
  if (request) {
    const geo = geolocation(request)

    return {
      country: geo.country ?? null,
      city: geo.city ?? null,
      region: geo.countryRegion ?? null,
    }
  }

  const headersList = headers()
  const region = headersList.get("X-Vercel-IP-Country-Region")
  const country = headersList.get("X-Vercel-IP-Country")
  const city = headersList.get("X-Vercel-IP-City")

  return {
    country: country ? decodeURIComponent(country) : null,
    region: region ? decodeURIComponent(region) : null,
    city: city ? decodeURIComponent(city) : null,
  }
}
