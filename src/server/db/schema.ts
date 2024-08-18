import { DEFAULT_LOCALE, LOCALES } from "@/lib/consts"
import { relations, sql } from "drizzle-orm"
import {
  integer,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core"

const CURRENT_TIMESTAMP = sql`(unixepoch())`

// You can add a prefix to table names to host multiple projects on the same
// database
const createTable = sqliteTableCreator((name) => name)

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
export type UserRole = User["role"]

export const userRelations = relations(user, ({ many, one }) => ({
  password: one(password, {
    fields: [user.id],
    references: [password.userId],
  }),
  organizationMemberships: many(organizationMembership),
  profile: one(profile),
}))

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

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}))

export const organization = createTable("organization", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
})
export type Organization = typeof organization.$inferSelect

export const organizationRelations = relations(organization, ({ many }) => ({
  memberships: many(organizationMembership),
}))

export const organizationMembership = createTable(
  "organization_membership",
  {
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(CURRENT_TIMESTAMP)
      .notNull(),

    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: text("role", { enum: ["owner", "admin", "member"] })
      .notNull()
      .default("member"),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_organization_membership",
      columns: [table.userId, table.organizationId],
    }),
  }),
)
export type OrganizationMembership = typeof organizationMembership.$inferSelect

export const organizationMembershipRelations = relations(
  organizationMembership,
  ({ one }) => ({
    user: one(user, {
      fields: [organizationMembership.userId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [organizationMembership.organizationId],
      references: [organization.id],
    }),
  }),
)

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

export const webhookEvent = createTable("webhook_event", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),

  event: text("event").notNull(),
  externalId: text("external_id").notNull().unique(),
  payload: text("payload"),
  provider: text("provider", { enum: ["stripe"] }).notNull(),

  retries: integer("retries").notNull().default(0),
})
export type WebhookEvent = typeof webhookEvent.$inferSelect
export type WebhookProvider = WebhookEvent["provider"]
