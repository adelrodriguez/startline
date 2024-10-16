import "server-only"

import db, { activityLog } from "~/server/db"

export type ActivityLog = typeof activityLog.$inferSelect
export type NewActivityLog = typeof activityLog.$inferInsert

export type ActivityType = ActivityLog["type"]

export async function createActivityLog(values: NewActivityLog) {
  await db.insert(activityLog).values(values)
}
