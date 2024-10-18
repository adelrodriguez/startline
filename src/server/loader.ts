import { redirect } from "next/navigation"
import { cache } from "react"
import { getCurrentSession } from "~/lib/auth/session"
import { UNAUTHORIZED_URL } from "~/lib/consts"
import {
  type Organization,
  findAccountsByUserId,
  findOrganizationById,
  findOrganizationInvitationByToken,
} from "~/server/data/organization"
import type { User } from "~/server/data/user"
import { OrganizationError, OrganizationInvitationError } from "~/utils/error"

export const getCurrentUser = cache(async (): Promise<User> => {
  const { user } = await getCurrentSession()

  if (!user) {
    redirect(UNAUTHORIZED_URL)
  }

  return user
})

export const getFirstOrganization = cache(async (): Promise<Organization> => {
  const user = await getCurrentUser()

  const accounts = await findAccountsByUserId(user.id)
  const firstAccount = accounts[0]

  if (!firstAccount) {
    throw new OrganizationError("User does not have any organizations")
  }

  const organization = await findOrganizationById(firstAccount.organizationId)

  if (!organization) {
    throw new OrganizationError("Organization does not exist")
  }

  return organization
})

export const getOrganizationFromInvitation = cache(
  async (token: string): Promise<Organization> => {
    const invitation = await findOrganizationInvitationByToken(token)

    if (!invitation) {
      throw new OrganizationInvitationError("Invalid or expired invitation")
    }

    const organization = await findOrganizationById(invitation.organizationId)

    if (!organization) {
      throw new OrganizationError("Organization does not exist")
    }

    return organization
  },
)
