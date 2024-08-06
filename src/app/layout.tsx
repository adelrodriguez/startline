import { Providers } from "@/components/providers"
import { cn, fonts } from "@/utils/ui"
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <Providers>
        <body className={cn("h-full", fonts.body.className)}>{children}</body>

        <Analytics />
      </Providers>
    </html>
  )
}
