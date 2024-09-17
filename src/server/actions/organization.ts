"use server"

import { parseWithZod } from "@conform-to/zod"
import { validateRequest } from "~/lib/auth"
import { InviteMemberSchema } from "~/lib/validation"
import {
  assertIsOrganizationMember,
  createOrganizationInvitation,
  OrganizationId,
} from "~/server/data/organization"
import { UserId } from "~/server/data/user"
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
}
