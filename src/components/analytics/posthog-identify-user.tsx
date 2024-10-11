"use client"

import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import type { User } from "~/server/data/user"

export default function PostHogIdentifyUser({ user }: { user: User }) {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) return

    posthog.identify(user.id.toString(), {
      email: user.email,
    })
  }, [posthog, user.id, user.email])

  return null
}
