import { createSharedPathnamesNavigation } from "next-intl/navigation"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { DEFAULT_LOCALE, LOCALES, type Locale } from "~/lib/consts"

export default getRequestConfig(async ({ locale = DEFAULT_LOCALE }) => {
  if (!LOCALES.includes(locale as Locale)) {
    notFound()
  }

  return {
    messages: (await import(`../../translations/${locale}.json`)).default,
  }
})

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createSharedPathnamesNavigation({
    locales: LOCALES,
    localePrefix: "as-needed",
  })
