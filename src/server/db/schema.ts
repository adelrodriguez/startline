import { USER_ROLES, WEBHOOK_PROVIDERS } from "@/lib/consts"
import { relations, sql } from "drizzle-orm"
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

// You can add a prefix to table names to host multiple projects on the same
// database
const createTable = sqliteTableCreator((name) => name)

export const user = createTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),

  role: text("role", { enum: USER_ROLES }).notNull().default("user"),

  email: text("email").notNull().unique(),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),

  // Accounts
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
})
export type User = typeof user.$inferSelect
export type UserValues = typeof user.$inferInsert

export const userRelations = relations(user, ({ many, one }) => ({
  password: one(password, {
    fields: [user.id],
    references: [password.userId],
  }),
}))

export const password = createTable("password", {
  hash: text("hash").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
})
export type Password = typeof password.$inferSelect
export type PasswordValues = typeof password.$inferInsert

export const signInCode = createTable("sign_in_code", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  email: text("email").notNull().unique(),

  hash: text("hash").notNull(),
})
export type SignInCode = typeof signInCode.$inferSelect
export type SignInCodeValues = typeof signInCode.$inferInsert

export const emailVerificationCode = createTable("email_verification_code", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),

  hash: text("hash").notNull(),
})
export type EmailVerificationCode = typeof emailVerificationCode.$inferSelect
export type EmailVerificationCodeValues =
  typeof emailVerificationCode.$inferInsert

export const passwordResetToken = createTable("password_reset_token", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),

  hash: text("token").notNull(),
})
export type PasswordResetToken = typeof passwordResetToken.$inferSelect
export type PasswordResetTokenValues = typeof passwordResetToken.$inferInsert

export const session = createTable("session", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  expiresAt: integer("expires_at").notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

  // Additional session data
  ipAddress: text("ip_address"),
})
export type Session = typeof session.$inferSelect
export type SessionValues = typeof session.$inferInsert

export const webhookEvent = createTable("webhook_event", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),

  event: text("event").notNull(),
  externalId: text("external_id").notNull(),
  payload: text("payload"),
  provider: text("provider", { enum: WEBHOOK_PROVIDERS }).notNull(),
})
export type WebhookEvent = typeof webhookEvent.$inferSelect
export type WebhookEventValues = typeof webhookEvent.$inferInsert
