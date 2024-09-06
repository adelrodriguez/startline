import { DEFAULT_LOCALE, LOCALES } from "@/lib/consts"
import type { Branded } from "@/utils/type"
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core"
import { CURRENT_TIMESTAMP, createTable } from "./helpers"

export const user = createTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),

  email: text("email").notNull().unique(),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),

  // Accounts
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
})
export type User = typeof user.$inferSelect
export type UserId = Branded<User["id"], "UserId">
export type UserRole = User["role"]

export const profile = createTable(
  "profile",
  {
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(CURRENT_TIMESTAMP)
      .notNull(),

    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    name: text("name"),
    avatarUrl: text("avatar_url"),
    phoneNumber: text("phone_number"),
    preferredLocale: text("preferred_locale", { enum: LOCALES })
      .notNull()
      .default(DEFAULT_LOCALE),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_profile",
      columns: [table.userId],
    }),
  }),
)
export type Profile = typeof profile.$inferSelect

export const password = createTable("password", {
  hash: text("hash").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
})
export type Password = typeof password.$inferSelect

export const signInCode = createTable("sign_in_code", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  email: text("email").notNull().unique(),

  hash: text("hash").notNull(),
})
export type SignInCode = typeof signInCode.$inferSelect

export const emailVerificationCode = createTable("email_verification_code", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),

  hash: text("hash").notNull(),
})
export type EmailVerificationCode = typeof emailVerificationCode.$inferSelect

export const passwordResetToken = createTable("password_reset_token", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),

  hash: text("token").notNull(),
})
export type PasswordResetToken = typeof passwordResetToken.$inferSelect

export const session = createTable("session", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  expiresAt: integer("expires_at").notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

  // Additional session data
  ipAddress: text("ip_address"),
})
export type Session = typeof session.$inferSelect
