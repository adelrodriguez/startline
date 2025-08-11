"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"
import type { User } from "~/server/data/user"

export function PostHogIdentifyUser({ user }: { user: User }) {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) return

    posthog.identify(user.id.toString(), {
      email: user.email,
    })
  }, [posthog, user.id, user.email])

  return null
}

export function PostHogTrackPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!(posthog && pathname)) return

    const url = new URL(pathname, window.location.origin)
    url.search = searchParams.toString()
    const currentPath = url.toString()

    if (currentPath === prevPathRef.current) return

    posthog.capture("$pageview", {
      $current_url: currentPath,
    })

    prevPathRef.current = currentPath
  }, [pathname, searchParams, posthog])

  return null
}
