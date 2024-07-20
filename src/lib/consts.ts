export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
} as const

export const USER_ROLES = [UserRoles.ADMIN, UserRoles.USER] as const

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles]
