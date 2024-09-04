"use server"

import { validateRequest } from "@/lib/auth"
import { InviteMemberSchema } from "@/lib/validation"
import {
  assertIsOrganizationMember,
  createOrganizationInvitation,
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

  await assertIsOrganizationMember(submission.value.organizationId, user.id)

  await createOrganizationInvitation(
    submission.value.organizationId,
    submission.value.email,
    submission.value.role,
  )
}
