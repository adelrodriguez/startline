import { integer, primaryKey, text } from "drizzle-orm/sqlite-core"
import { DEFAULT_LOCALE, LOCALES, MIME_TYPES } from "~/lib/consts"
import { CURRENT_TIMESTAMP, createTable } from "./helpers"

export const user = createTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),

  email: text("email").notNull().unique(),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),

  // OAuth accounts
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
})

export const profile = createTable(
  "profile",
  {
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$onUpdateFn(() => new Date())
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
    primaryKey: primaryKey({ columns: [table.userId] }),
  }),
)

export const password = createTable("password", {
  hash: text("hash").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
})

export const signInCode = createTable("sign_in_code", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

  email: text("email").notNull().unique(),

  hash: text("hash").notNull(),
})

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

export const organization = createTable("organization", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  name: text("name").notNull(),
})

export const account = createTable(
  "account",
  {
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$onUpdateFn(() => new Date())
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
    primaryKey: primaryKey({ columns: [table.userId, table.organizationId] }),
  }),
)

export const organizationInvitation = createTable("organization_invitation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  organizationId: integer("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "member"] })
    .notNull()
    .default("member"),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
})

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

export const asset = createTable("asset", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  service: text("service", { enum: ["r2", "uploadthing"] }).notNull(),
  bucket: text("bucket"),

  name: text("name"),
  mimeType: text("mime_type", { enum: MIME_TYPES }).notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),

  url: text("url").notNull(),
  status: text("status", { enum: ["pending", "uploaded"] })
    .notNull()
    .default("pending"),

  userId: integer("user_id").references(() => user.id),
})
