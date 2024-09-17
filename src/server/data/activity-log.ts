import "server-only"

import db, { activityLog } from "~/server/db"

export type ActivityLog = typeof activityLog.$inferSelect
export type NewActivityLog = typeof activityLog.$inferInsert

export type ActivityType = ActivityLog["type"]

export function createActivityLog(values: NewActivityLog) {
  return db.insert(activityLog).values(values)
}
