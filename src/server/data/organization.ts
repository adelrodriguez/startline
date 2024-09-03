import "server-only"

import db, {
  type Organization,
  type User,
  account,
  filters,
  organization,
} from "@/server/db"
import { throwIf, throwUnless } from "@/utils/assert"
import { OrganizationError } from "@/utils/error"
import type { OmitId } from "@/utils/type"

export async function createOrganization(
  values: OmitId<typeof organization.$inferInsert>,
  options?: {
    ownerId?: User["id"]
  },
) {
  const newOrganization = await db
    .insert(organization)
    .values(values)
    .returning()
    .get()

  if (options?.ownerId) {
    await addOwnerToOrganization(newOrganization.id, options.ownerId)
  }

  return newOrganization
}

export async function findOrganizationById(organizationId: Organization["id"]) {
  const existingOrganization = await db.query.organization.findFirst({
    where: (model, { eq }) => eq(model.id, organizationId),
  })

  return existingOrganization ?? null
}

export function findAccountsByUserId(userId: User["id"]) {
  return db.query.account.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
  })
}

export async function addMemberToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  return db
    .insert(account)
    .values({
      organizationId,
      userId,
      role: "member",
    })
    .returning()
}

export async function addAdminToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  return db
    .insert(account)
    .values({
      organizationId,
      userId,
      role: "admin",
    })
    .returning()
}

export function addOwnerToOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  return db
    .insert(account)
    .values({
      organizationId,
      userId,
      role: "owner",
    })
    .returning()
}

export async function removeMemberFromOrganization(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  const membership = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
    columns: {
      role: true,
    },
  })

  throwIf(
    !membership,
    new OrganizationError("User is not a member of the organization"),
  )

  throwIf(
    membership?.role === "owner",
    new OrganizationError("User is the owner of the organization"),
  )

  await db
    .delete(account)
    .where(
      filters.and(
        filters.eq(account.userId, userId),
        filters.eq(account.organizationId, organizationId),
      ),
    )
}

export async function assertIsOrganizationOwner(
  organizationId: Organization["id"],
  userId: User["id"],
) {
  const membership = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
    columns: {
      role: true,
    },
  })

  throwIf(
    !membership,
    new OrganizationError("User is not a member of the organization"),
  )

  throwUnless(
    membership?.role === "owner",
    "User is not an owner of the organization",
  )
}
