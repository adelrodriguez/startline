"use client"

import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import type { AuthUser } from "~/lib/auth"

export default function PostHogIdentifyUser({ user }: { user: AuthUser }) {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) return

    posthog.identify(user.id.toString(), {
      email: user.email,
    })
  }, [posthog, user.id, user.email])

  return null
}
