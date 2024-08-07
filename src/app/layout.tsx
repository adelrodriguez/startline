import { Providers } from "@/components/providers"
import type { Locale } from "@/lib/consts"
import { fileRouter } from "@/services/uploadthing"
import { fonts } from "@/utils/fonts"
import { cn } from "@/utils/ui"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next"
import { extractRouterConfig } from "uploadthing/server"

import "@/styles/tailwind.css"

export const metadata: Metadata = {
  title: "Startline",
  description: "This is your project's home page",
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{ children: React.ReactNode; params: { locale: Locale } }>) {
  return (
    <html lang={locale} className="h-full">
      <Providers>
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fonts.body.variable,
          )}
        >
          {children}
        </body>

        <Analytics />
      </Providers>
    </html>
  )
}
