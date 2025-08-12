"use client"

import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { ReactNode } from "react"
import { ConvexClientProvider } from "~/shared/components/convex"
import { Toaster } from "~/shared/components/ui/sonner"
import { TooltipProvider } from "~/shared/components/ui/tooltip"

export default function Providers({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ConvexClientProvider>
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
    </ConvexClientProvider>
  )
}
