"use server"

import { validateRequest } from "@/lib/auth"
import { InviteMemberSchema } from "@/lib/validation"
import {
  assertIsOrganizationMember,
  createOrganizationId,
  createOrganizationInvitation,
  createUserId,
} from "@/server/data"
import { AuthError } from "@/utils/error"
import { parseWithZod } from "@conform-to/zod"

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

  const organizationId = createOrganizationId(submission.value.organizationId)
  const userId = createUserId(user.id)

  await assertIsOrganizationMember(organizationId, userId)

  await createOrganizationInvitation(
    organizationId,
    submission.value.email,
    submission.value.role,
  )
}
