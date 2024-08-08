"use client"

import env from "@/lib/env.client"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider, usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  })
}

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PostHogProvider client={posthog}>
      <TrackPageview />
      {children}
    </PostHogProvider>
  )
}

function TrackPageview() {
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
