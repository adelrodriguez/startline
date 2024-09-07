import { integer, text } from "drizzle-orm/sqlite-core"
import type { Branded } from "~/utils/type"
import { CURRENT_TIMESTAMP, createTable } from "./helpers"
import { user } from "./user"

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

export const asset = createTable("asset", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(CURRENT_TIMESTAMP)
    .notNull(),

  service: text("service", { enum: ["r2", "uploadthing"] }).notNull(),
  bucket: text("bucket"),

  name: text("name"),
  mimeType: text("mime_type").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),

  url: text("url").notNull(),
  status: text("status", { enum: ["pending", "uploaded"] })
    .notNull()
    .default("pending"),

  userId: integer("user_id").references(() => user.id),
})
export type Asset = typeof asset.$inferSelect
export type AssetId = Branded<Asset["id"], "AssetId">
