"use client"

import { TooltipProvider } from "@/components/ui"
import env from "@/lib/env.client"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

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
      <TooltipProvider>{children}</TooltipProvider>
    </PostHogProvider>
  )
}
