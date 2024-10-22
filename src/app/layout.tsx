import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import { extractRouterConfig } from "uploadthing/server"

import Providers from "~/components/providers"
import { APP_NAME, type Locale } from "~/lib/consts"
import env from "~/lib/env.client"
import { fileRouter } from "~/services/uploadthing"
import { fonts } from "~/utils/fonts"
import { cn } from "~/utils/ui"

import "~/styles/tailwind.css"

export const metadata: Metadata = {
  title: APP_NAME,
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
