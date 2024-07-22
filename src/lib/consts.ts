export const FALLBACK_IP = "127.0.0.1"

// Auth
export const AUTHORIZED_URL = "/my"
export const UNAUTHORIZED_URL = "/sign-in"

// User
export const USER_ROLES = ["admin", "user"] as const
export type UserRole = (typeof USER_ROLES)[number]

// Webhooks
export const WEBHOOK_PROVIDERS = ["stripe"] as const
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number]
