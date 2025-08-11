import { getRequestConfig } from "next-intl/server"
import type { Locale } from "~/shared/consts"
import { routing } from "~/shared/i18n/routing"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale

  // Ensure that the incoming locale is valid
  if (!(locale && routing.locales.includes(locale))) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../../translations/${locale}.json`)).default,
  }
})
