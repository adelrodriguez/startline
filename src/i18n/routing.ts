import createMiddleware from "next-intl/middleware"
import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"
import { DEFAULT_LOCALE, LOCALES } from "~/lib/consts"

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Set this to "as-needed" if your whole app is localized
  localePrefix: "always",
})

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing)

export const nextIntlMiddleware = createMiddleware(routing)
