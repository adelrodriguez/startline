"use client"

import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { Suspense } from "react"
import { PostHogTrackPageview } from "~/components/analytics/posthog"
import { Toaster } from "~/components/ui/sonner"
import { TooltipProvider } from "~/components/ui/tooltip"
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
      <Suspense fallback={null}>
        <PostHogTrackPageview />
      </Suspense>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        <TooltipProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
