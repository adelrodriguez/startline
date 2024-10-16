import { pgEnum, primaryKey } from "drizzle-orm/pg-core"
import { DEFAULT_LOCALE, LOCALES } from "~/lib/consts"
import { createPublicId, createTable } from "~/server/db/schema/helpers"
import type { Brand } from "~/utils/type"

export const userRoleEnum = pgEnum("user_role", ["admin", "user"])

export const user = createTable("user", (t) => ({
  id: t
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "UserId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("usr"))
    .$type<Brand<string, "PublicUserId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date" })
    .$onUpdateFn(() => new Date())
    .defaultNow()
    .notNull(),

  role: userRoleEnum().notNull().default("user"),

  email: t.text().notNull().unique(),
  emailVerifiedAt: t.timestamp({ mode: "date" }),

  // OAuth accounts
  googleId: t.text().unique(),
  githubId: t.text().unique(),
}))

export const localeEnum = pgEnum("locale", LOCALES)

export const profile = createTable(
  "profile",
  (t) => ({
    updatedAt: t
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),

    userId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
      .unique()
      .$type<Brand<bigint, "UserId">>(),

    name: t.text(),
    avatarUrl: t.text(),
    phoneNumber: t.text(),
    preferredLocale: localeEnum().notNull().default(DEFAULT_LOCALE),
  }),
  (table) => ({
    primaryKey: primaryKey({ columns: [table.userId] }),
  }),
)

export const password = createTable("password", (t) => ({
  hash: t.text().notNull(),
  userId: t
    .bigint({ mode: "bigint" })
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique()
    .$type<Brand<bigint, "UserId">>(),
}))

export const signInCode = createTable("sign_in_code", (t) => ({
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  expiresAt: t.timestamp({ mode: "date" }).notNull(),
  email: t.text().notNull().unique(),
  hash: t.text().notNull(),
}))

export const emailVerificationCode = createTable(
  "email_verification_code",
  (t) => ({
    createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
    expiresAt: t.timestamp({ mode: "date" }).notNull(),
    userId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
      .unique()
      .$type<Brand<bigint, "UserId">>(),
    hash: t.text().notNull(),
  }),
)

export const passwordResetToken = createTable("password_reset_token", (t) => ({
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  expiresAt: t.timestamp({ mode: "date" }).notNull(),
  userId: t
    .bigint({ mode: "bigint" })
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .unique()
    .$type<Brand<bigint, "UserId">>(),
  hash: t.text().notNull(),
}))

export const session = createTable("session", (t) => ({
  id: t.text().primaryKey().$type<Brand<string, "SessionId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("sess"))
    .$type<Brand<string, "SessionPublicId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  expiresAt: t.timestamp({ mode: "date" }).notNull(),
  userId: t
    .bigint({ mode: "bigint" })
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .$type<Brand<bigint, "UserId">>(),

  // Additional information
  ipAddress: t.text(),
  country: t.text(),
  region: t.text(),
  city: t.text(),
}))

export const organization = createTable("organization", (t) => ({
  id: t
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "OrganizationId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("org"))
    .$type<Brand<string, "OrganizationPublicId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date" })
    .$onUpdateFn(() => new Date())
    .defaultNow()
    .notNull(),
  name: t.text().notNull(),
}))

export const accountRoleEnum = pgEnum("account_role", [
  "owner",
  "admin",
  "member",
])

export const account = createTable(
  "account",
  (t) => ({
    publicId: t
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("acc"))
      .$type<Brand<string, "AccountPublicId">>(),
    createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),
    userId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<Brand<bigint, "UserId">>(),
    organizationId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),
    role: accountRoleEnum().notNull().default("member"),
  }),
  (table) => ({
    primaryKey: primaryKey({ columns: [table.userId, table.organizationId] }),
  }),
)

export const organizationInvitation = createTable(
  "organization_invitation",
  (t) => ({
    id: t
      .bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "OrganizationInvitationId">>(),
    publicId: t
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("inv"))
      .$type<Brand<string, "OrganizationInvitationPublicId">>(),
    createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),
    organizationId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),
    inviterId: t
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "UserId">>(),
    email: t.text().notNull(),
    role: accountRoleEnum().notNull().default("member"),
    token: t.text().notNull().unique(),
    expiresAt: t.timestamp({ mode: "date" }).notNull(),
  }),
)

export const webhookEvent = createTable("webhook_event", (t) => ({
  id: t
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "WebhookEventId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("wh"))
    .$type<Brand<string, "WebhookEventPublicId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  processedAt: t.timestamp({ mode: "date" }),
  event: t.text().notNull(),
  externalId: t.text().notNull().unique(),
  payload: t.jsonb().notNull(),
  provider: t.text({ enum: ["stripe"] }).notNull(),
  retries: t.integer().notNull().default(0),
}))

export const assetStatusEnum = pgEnum("asset_status", ["pending", "uploaded"])
export const mimeTypeEnum = pgEnum("mime_type", [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
  "application/pdf",
])

export const asset = createTable("asset", (t) => ({
  id: t
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "AssetId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("ast"))
    .$type<Brand<string, "AssetPublicId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date" })
    .$onUpdateFn(() => new Date())
    .defaultNow()
    .notNull(),
  service: t.text({ enum: ["r2", "uploadthing"] }).notNull(),
  bucket: t.text(),
  name: t.text(),
  mimeType: mimeTypeEnum().notNull(),
  filename: t.text().notNull(),
  size: t.integer().notNull(),
  url: t.text().notNull(),
  status: assetStatusEnum().notNull().default("pending"),
  userId: t
    .bigint({ mode: "bigint" })
    .references(() => user.id)
    .$type<Brand<bigint, "UserId">>(),
}))

export const activityLogTypeEnum = pgEnum("activity_log_type", [
  "accepted_organization_invitation",
  "created_asset",
  "created_organization",
  "declined_organization_invitation",
  "deleted_account",
  "deleted_email_verification_codes",
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
])

export const activityLog = createTable("activity_log", (t) => ({
  id: t
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "ActivityLogId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("act"))
    .$type<Brand<string, "ActivityLogPublicId">>(),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  type: activityLogTypeEnum().notNull(),
  userId: t
    .bigint({ mode: "bigint" })
    .references(() => user.id)
    .$type<Brand<bigint, "UserId">>(),
  organizationId: t
    .bigint({ mode: "bigint" })
    .references(() => organization.id)
    .$type<Brand<bigint, "OrganizationId">>(),
  ipAddress: t.text(),
}))
