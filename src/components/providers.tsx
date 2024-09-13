"use client"

import { ThemeProvider } from "next-themes"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { TooltipProvider } from "~/components/ui"
import env from "~/lib/env.client"

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
