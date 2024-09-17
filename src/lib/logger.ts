import "server-only"

import { getIpAddress } from "~/utils/headers"
import type { UserId } from "~/server/data/user"
import type { OrganizationId } from "~/server/data/organization"
import {
  type ActivityType,
  createActivityLog,
} from "~/server/data/activity-log"

export function logActivity(
  type: ActivityType,
  values?: { userId?: UserId; organizationId?: OrganizationId },
) {
  return createActivityLog({
    type,
    ipAddress: getIpAddress(),
    ...values,
  })
}
