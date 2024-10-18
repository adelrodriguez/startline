"use server"

import { parseWithZod } from "@conform-to/zod"
import { getCurrentSession } from "~/lib/auth/session"
import { AuthError } from "~/lib/error"
import { logActivity } from "~/lib/logger"
import { createInviteMemberSchema } from "~/lib/validation/forms"
import {
  type OrganizationId,
  assertUserIsOrganizationMember,
  createOrganizationInvitation,
} from "~/server/data/organization"

export async function inviteMember(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createInviteMemberSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  const { user } = await getCurrentSession()

  if (!user) throw new AuthError("User not found")

  // TODO(adelrodriguez): Get this from the current organization
  const organizationId = submission.value.organizationId as OrganizationId

  await assertUserIsOrganizationMember(organizationId, user.id)

  await createOrganizationInvitation(organizationId, user.id, {
    email: submission.value.email,
    role: submission.value.role,
  })

  await logActivity("invited_member_to_organization", {
    userId: user.id,
    organizationId,
  })
}
