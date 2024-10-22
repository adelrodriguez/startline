import "server-only"

import {
  type ActivityType,
  createActivityLog,
} from "~/server/data/activity-log"
import type { OrganizationId } from "~/server/data/organization"
import type { UserId } from "~/server/data/user"
import { getIpAddress } from "~/utils/headers"

export async function logActivity(
  type: ActivityType,
  values?: { userId?: UserId; organizationId?: OrganizationId },
) {
  return createActivityLog({
    type,
    ipAddress: await getIpAddress(),
    ...values,
  })
}
