import { primaryKey } from "drizzle-orm/sqlite-core"

import { DEFAULT_LOCALE, LOCALES } from "~/lib/consts"
import { CURRENT_TIMESTAMP, createTable } from "~/server/db/schema/helpers"

export const user = createTable("user", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  role: t
    .text({ enum: ["admin", "user"] })
    .notNull()
    .default("user"),

  email: t.text().notNull().unique(),
  emailVerifiedAt: t.integer({ mode: "timestamp" }),

  // OAuth accounts
  googleId: t.text().unique(),
  githubId: t.text().unique(),
}))

export const profile = createTable(
  "profile",
  (t) => ({
    updatedAt: t
      .integer({ mode: "timestamp" })
      .$onUpdateFn(() => new Date())
      .default(CURRENT_TIMESTAMP)
      .notNull(),

    userId: t
      .integer()
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    name: t.text(),
    avatarUrl: t.text(),
    phoneNumber: t.text(),
    preferredLocale: t.text({ enum: LOCALES }).notNull().default(DEFAULT_LOCALE),
  }),
  (table) => ({
    primaryKey: primaryKey({ columns: [table.userId] }),
  }),
)

export const password = createTable("password", (t) => ({
  hash: t.text().notNull(),
  userId: t
    .integer()
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
}))
export const signInCode = createTable("sign_in_code", (t) => ({
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
  email: t.text().notNull().unique(),
  hash: t.text().notNull(),
}))

export const emailVerificationCode = createTable("email_verification_code", (t) => ({
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
  userId: t
    .integer()
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
  hash: t.text().notNull(),
}))

export const passwordResetToken = createTable("password_reset_token", (t) => ({
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
  userId: t
    .integer()
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique(),
  hash: t.text().notNull(),
}))

export const session = createTable("session", (t) => ({
  id: t.text().primaryKey(),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  expiresAt: t.integer().notNull(),
  userId: t
    .integer()
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  ipAddress: t.text(),
}))

export const organization = createTable("organization", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  name: t.text().notNull(),
}))

export const account = createTable(
  "account",
  (t) => ({
    createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
    updatedAt: t
      .integer({ mode: "timestamp" })
      .$onUpdateFn(() => new Date())
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    userId: t
      .integer()
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    organizationId: t
      .integer()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: t
      .text({ enum: ["owner", "admin", "member"] })
      .notNull()
      .default("member"),
  }),
  (table) => ({
    primaryKey: primaryKey({ columns: [table.userId, table.organizationId] }),
  }),
)

export const organizationInvitation = createTable("organization_invitation", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  organizationId: t
    .integer()
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  inviterId: t
    .integer()
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  email: t.text().notNull(),
  role: t
    .text({ enum: ["admin", "member"] })
    .notNull()
    .default("member"),
  token: t.text().notNull().unique(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),
}))

export const webhookEvent = createTable("webhook_event", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  processedAt: t.integer({ mode: "timestamp" }),
  event: t.text().notNull(),
  externalId: t.text().notNull().unique(),
  payload: t.text(),
  provider: t.text({ enum: ["stripe"] }).notNull(),
  retries: t.integer().notNull().default(0),
}))

export const asset = createTable("asset", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  updatedAt: t
    .integer({ mode: "timestamp" })
    .$onUpdateFn(() => new Date())
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  service: t.text({ enum: ["r2", "uploadthing"] }).notNull(),
  bucket: t.text(),
  name: t.text(),
  mimeType: t
    .text({
      enum: ["image/png", "image/jpeg", "image/jpg", "image/webp", "text/plain", "application/pdf"],
    })
    .notNull(),
  filename: t.text().notNull(),
  size: t.integer().notNull(),
  url: t.text().notNull(),
  status: t
    .text({ enum: ["pending", "uploaded"] })
    .notNull()
    .default("pending"),
  userId: t.integer().references(() => user.id),
}))

export const activityLog = createTable("activity_log", (t) => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt: t.integer({ mode: "timestamp" }).default(CURRENT_TIMESTAMP).notNull(),
  type: t
    .text({
      enum: [
        "accepted_organization_invitation",
        "created_asset",
        "created_organization",
        "declined_organization_invitation",
        "deleted_account",
        "invited_member_to_organization",
        "marked_asset_as_uploaded",
        "marked_email_as_verified",
        "removed_organization_member",
        "requested_email_verification",
        "requested_password_reset",
        "requested_sign_in_code",
        "reset_password",
        "signed_in_with_code",
        "signed_in_with_github",
        "signed_in_with_google",
        "signed_in_with_password",
        "signed_out",
        "signed_up_with_code",
        "signed_up_with_github",
        "signed_up_with_google",
        "signed_up_with_password",
      ],
    })
    .notNull(),
  userId: t.integer().references(() => user.id),
  organizationId: t.integer().references(() => organization.id),
  ipAddress: t.text(),
}))
