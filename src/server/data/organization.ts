"server-only"

import {
  type Organization,
  type User,
  deleteOrganizationMembership,
  insertOrganization,
  insertOrganizationMembership,
  type organization,
  selectOrganization,
  selectOrganizationMembership,
  selectOrganizationMemberships,
} from "@/server/db"
import { throwIf } from "@/utils/assert"
import { NotFoundError } from "@/utils/error"

export async function createOrganization(
  values: Omit<typeof organization.$inferInsert, "id">,
  options?: {
    ownerId?: User["id"]
  },
) {
  const organization = await insertOrganization({ ...values })

  if (options?.ownerId) {
    await addOwnerToOrganization(organization.id, options.ownerId)
  }

  return organization
}

export async function findOrganizationById(organizationId: Organization["id"]) {
  const organization = await selectOrganization(organizationId)

  return organization ?? null
}

export async function findOrganizationMembershipsByUserId(userId: User["id"]) {
  const memberships = await selectOrganizationMemberships({
    userId,
  })

  return memberships ?? null
}

export async function addMemberToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  await insertOrganizationMembership(organizationId, userId, {
    role: "member",
  })
}

export async function addAdminToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  await insertOrganizationMembership(organizationId, userId, {
    role: "admin",
  })
}

export async function addOwnerToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  await insertOrganizationMembership(organizationId, userId, {
    role: "owner",
  })
}

export async function removeMemberFromOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  const membership = await selectOrganizationMembership({
    organizationId,
    userId,
  })

  if (!membership) {
    throw new NotFoundError("User is not a member of the organization")
  }

  throwIf(membership.role === "owner", "User is the owner of the organization")

  await deleteOrganizationMembership(organizationId, userId)
}

export async function assertIsOrganizationOwner(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  const membership = await selectOrganizationMembership({
    organizationId,
    userId,
  })

  if (!membership) {
    throw new NotFoundError("User is not a member of the organization")
  }

  throwIf(
    membership.role !== "owner",
    "User is not an owner of the organization",
  )
}
