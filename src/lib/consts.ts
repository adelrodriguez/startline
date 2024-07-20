// User
export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
} as const

export const USER_ROLES = [UserRoles.ADMIN, UserRoles.USER] as const

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles]

// Auth
export const AUTHORIZED_URL = "/my"
export const UNAUTHORIZED_URL = "/sign-in"
