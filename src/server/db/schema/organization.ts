import { integer, primaryKey, text } from "drizzle-orm/sqlite-core"
import { CURRENT_TIMESTAMP, createTable } from "./helpers"
import { user } from "./user"

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

export const account = createTable(
  "account",
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
      name: "pk_account",
      columns: [table.userId, table.organizationId],
    }),
  }),
)
export type Account = typeof account.$inferSelect
