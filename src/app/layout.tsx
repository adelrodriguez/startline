import { Providers } from "@/components/providers"
import type { Locale } from "@/lib/consts"
import { fonts } from "@/utils/fonts"
import { cn } from "@/utils/ui"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next"

import "@/styles/tailwind.css"
import "@uploadthing/react/styles.css"

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
        <body className={cn("h-full", fonts.body.className)}>{children}</body>

        <Analytics />
      </Providers>
    </html>
  )
}
