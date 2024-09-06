import createMiddleware from "next-intl/middleware"
import { DEFAULT_LOCALE, LOCALES } from "~/lib/consts"

export const nextIntlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
})
