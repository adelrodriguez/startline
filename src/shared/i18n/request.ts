import { getRequestConfig } from "next-intl/server"
import { routing } from "~/i18n/routing"
import type { Locale } from "~/shared/consts"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale

  // Ensure that the incoming locale is valid
  if (!(locale && routing.locales.includes(locale))) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../translations/${locale}.json`)).default,
  }
})
