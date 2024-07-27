import { AUTHORIZED_URL } from "@/lib/consts"
import env from "@/lib/env.server"

export function buildUrl<T extends string>(
  pathname: T,
  options?: { query?: Record<string, string | number>; decoded?: boolean },
): string {
  const url = new URL(pathname, env.BASE_URL)

  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(key, value.toString())
    }
  }

  const stringUrl = url.toString()

  if (options?.decoded) {
    return decodeURIComponent(stringUrl)
  }

  return stringUrl
}

export function buildAuthUrl<T extends string>(pathname: T) {
  return `${AUTHORIZED_URL}/${pathname}` as const
}
