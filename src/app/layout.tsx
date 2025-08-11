import type { Metadata } from "next"
import Providers from "~/shared/components/providers"
import { APP_NAME, type Locale } from "~/shared/consts"
import { cn, fonts } from "~/shared/utils/ui"

import "~/shared/assets/styles/tailwind.css"

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
    <html className="h-full" lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fonts.body.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
