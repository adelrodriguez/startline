"use server"

import { z } from "zod"
import { authActionClient } from "~/lib/action-client"
// import { withRateLimitByUser } from "~/lib/action-client"
import { InviteMemberSchema } from "~/lib/validation/forms"
import { createActivityLog } from "~/server/data/activity-log"
import {
  assertUserIsOrganizationMember,
  createOrganizationInvitation,
  type OrganizationId,
} from "~/server/data/organization"

export const inviteMember = authActionClient
  .metadata({ actionName: "organization/inviteMember" })
  // .use(withRateLimitByUser)
  .schema(InviteMemberSchema)
  // TODO(adelrodriguez): Replace this with the current organization (from a cookie)
  .bindArgsSchemas([z.coerce.bigint()])
  .action(
    async ({
      parsedInput: { email },
      // TODO(adelrodriguez): Replace this with a middleware that injects the
      // current organization
      bindArgsParsedInputs: [organizationId],
      ctx,
    }) => {
      await assertUserIsOrganizationMember(
        organizationId as OrganizationId,
        ctx.user.id
      )

      await createOrganizationInvitation(
        organizationId as OrganizationId,
        ctx.user.id,
        { email, role: "member" }
      )

      await createActivityLog("invited_member_to_organization", {
        userId: ctx.user.id,
        organizationId: organizationId as OrganizationId,
      })
    }
  )
