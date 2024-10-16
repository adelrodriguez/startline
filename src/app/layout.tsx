import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import dynamic from "next/dynamic"
import { extractRouterConfig } from "uploadthing/server"
import Providers from "~/components/providers"
import { Toaster } from "~/components/ui/sonner"
import { APP_NAME, type Locale } from "~/lib/consts"
import env from "~/lib/env.client"
import { fileRouter } from "~/services/uploadthing"
import { fonts } from "~/utils/fonts"
import { cn } from "~/utils/ui"

import "~/styles/tailwind.css"

export const metadata: Metadata = {
  title: APP_NAME,
}

const PostHogTrackPageview = dynamic(
  () => import("~/components/analytics/posthog-track-pageview"),
  {
    ssr: false,
  },
)

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{ children: React.ReactNode; params: { locale: Locale } }>) {
  return (
    <html lang={locale} className="h-full">
      <head>
        <PlausibleProvider domain={env.NEXT_PUBLIC_DOMAIN} />
      </head>
      <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fonts.body.variable,
        )}
      >
        <Providers>
          <PostHogTrackPageview />
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  )
}
