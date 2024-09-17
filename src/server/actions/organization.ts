"use server"

import { parseWithZod } from "@conform-to/zod"
import { validateRequest } from "~/lib/auth"
import { InviteMemberSchema } from "~/lib/validation/forms"
import {
  assertIsOrganizationMember,
  createOrganizationInvitation,
  OrganizationId,
} from "~/server/data/organization"
import { UserId } from "~/server/data/user"
import { logActivity } from "~/server/data/activity-log"
import { AuthError } from "~/utils/error"

export async function inviteMember(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: InviteMemberSchema,
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  const { user } = await validateRequest()

  if (!user) {
    throw new AuthError("User not found")
  }

  const organizationId = OrganizationId.parse(submission.value.organizationId)
  const userId = UserId.parse(user.id)

  await assertIsOrganizationMember(organizationId, userId)

  await createOrganizationInvitation(
    organizationId,
    submission.value.email,
    submission.value.role,
  )

  await logActivity("invited_member_to_organization", {
    userId,
    organizationId,
  })
}
