export const APP_NAME = "Startline"
export const APP_ID = "startline"

export const FALLBACK_IP = "127.0.0.1"

// Auth
export const AUTHORIZED_URL = "/my"
export const UNAUTHORIZED_URL = "/sign-in"
export const RESET_PASSWORD_URL = "/sign-in/reset-password"
export const VERIFICATION_EMAIL_COOKIE_NAME = "verification-email"

// i18n
export const Locales = {
  EN: "en",
  ES: "es",
} as const
export type Locale = (typeof Locales)[keyof typeof Locales]

export const LOCALES = [Locales.EN, Locales.ES] as const

export const DEFAULT_LOCALE = Locales.EN

// Organization Invitation
export const ACCEPT_INVITATION_URL = "/accept"
