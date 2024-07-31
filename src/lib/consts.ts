export const APP_NAME = "Startline"
export const APP_ID = "startline"

export const FALLBACK_IP = "127.0.0.1"

export const MOCK_RESEND_EMAIL = "mock-resend-email"

// Auth
export const AUTHORIZED_URL = "/my"
export const UNAUTHORIZED_URL = "/sign-in"
export const RESET_PASSWORD_URL = "/sign-in/reset-password"
export const VERIFICATION_EMAIL_COOKIE_NAME = "verification-email"

// User
export const USER_ROLES = ["admin", "user"] as const
export type UserRole = (typeof USER_ROLES)[number]

// Webhooks
export const WEBHOOK_PROVIDERS = ["stripe"] as const
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number]
