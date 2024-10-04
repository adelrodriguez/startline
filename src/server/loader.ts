import { redirect } from "next/navigation"
import { cache } from "react"
import { validateRequest } from "~/lib/auth"
import { UNAUTHORIZED_URL } from "~/lib/consts"
import {
  OrganizationId,
  findAccountsByUserId,
  findOrganizationById,
  findOrganizationInvitationByToken,
} from "~/server/data/organization"
import { UserId, findUserById } from "~/server/data/user"
import { throwUnless } from "~/utils/assert"
import { OrganizationError, OrganizationInvitationError } from "~/utils/error"

export const getCurrentUser = cache(async () => {
  const { user: authUser } = await validateRequest()

  if (!authUser) {
    return redirect(UNAUTHORIZED_URL)
  }

  const user = await findUserById(UserId.parse(authUser.id))

  throwUnless(user !== null, "User does not exist")

  return user
})

export const getFirstOrganization = cache(async () => {
  const user = await getCurrentUser()

  const accounts = await findAccountsByUserId(UserId.parse(user.id))
  const firstAccount = accounts[0]

  if (!firstAccount) {
    throw new OrganizationError("User does not have any organizations")
  }

  const organization = await findOrganizationById(
    OrganizationId.parse(firstAccount.organizationId),
  )

  throwUnless(organization !== null, "Organization does not exist")

  return organization
})

export const getOrganizationFromInvitation = cache(async (token: string) => {
  const invitation = await findOrganizationInvitationByToken(token)

  if (!invitation) {
    throw new OrganizationInvitationError("Invalid or expired invitation")
  }

  const organization = await findOrganizationById(
    OrganizationId.parse(invitation.organizationId),
  )

  throwUnless(organization !== null, "Organization does not exist")

  return organization
})
