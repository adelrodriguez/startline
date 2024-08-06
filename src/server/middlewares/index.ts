import { DEFAULT_LOCALE, LOCALES } from "@/lib/consts"
import createMiddleware from "next-intl/middleware"

export const nextIntlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
})
