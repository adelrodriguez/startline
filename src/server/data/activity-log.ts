import "server-only"

import db, { activityLog } from "~/server/db"
import { getIpAddress } from "~/utils/headers"
import type { StrictOmit } from "~/utils/type"
export type ActivityLog = typeof activityLog.$inferSelect
export type NewActivityLog = typeof activityLog.$inferInsert

type ActivityType = ActivityLog["type"]

export function logActivity(
  type: ActivityType,
  values?: StrictOmit<NewActivityLog, "type">,
) {
  return db.insert(activityLog).values({
    type,
    ipAddress: getIpAddress(),
    ...values,
  })
}
