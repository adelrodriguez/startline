import "server-only"

import db, { activityLog } from "~/server/db"
import { getIpAddress } from "~/utils/headers"

export type ActivityLog = typeof activityLog.$inferSelect
export type NewActivityLog = typeof activityLog.$inferInsert
export type ActivityType = ActivityLog["type"]

export async function createActivityLog(
  type: ActivityType,
  values?: Pick<NewActivityLog, "userId" | "organizationId">
) {
  await db.insert(activityLog).values({
    type,
    ipAddress: await getIpAddress(),
    ...values,
  })
}
