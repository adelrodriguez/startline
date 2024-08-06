"use client"

import PostHogProvider from "./PostHog"

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PostHogProvider>{children}</PostHogProvider>
}
