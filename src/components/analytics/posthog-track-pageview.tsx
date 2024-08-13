"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"

export default function PostHogTrackPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!posthog || !pathname) return

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
