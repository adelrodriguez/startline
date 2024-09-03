import { integer, text } from "drizzle-orm/sqlite-core"
import { CURRENT_TIMESTAMP, createTable } from "./helpers"

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
