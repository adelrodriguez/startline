import { USER_ROLES, UserRoles } from "@/lib/consts"
import { relations, sql } from "drizzle-orm"
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

// You can add a prefix to table names to host multiple projects on the same
// database
const createTable = sqliteTableCreator((name) => name)

export const user = createTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),

  role: text("role", { enum: USER_ROLES }).notNull().default(UserRoles.USER),

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
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
})
export type Password = typeof password.$inferSelect
export type PasswordValues = typeof password.$inferInsert

export const session = createTable("session", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  expiresAt: integer("expires_at").notNull(),

  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

  // Additional session data
  ipAddress: text("ip_address"),
})
export type Session = typeof session.$inferSelect
export type SessionValues = typeof session.$inferInsert
