import "server-only"

import { createDate, TimeSpan } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import OrganizationInvitationEmail from "~/components/emails/organization-invitation"
import { sendEmail } from "~/lib/emails"
import {
  NotFoundError,
  OrganizationError,
  OrganizationInvitationError,
} from "~/lib/error"
import type { UserId } from "~/server/data/user"
import db, {
  account,
  filters,
  organization,
  organizationInvitation,
  user,
} from "~/server/db"
import { invariantReturning } from "~/utils/invariant"

export type Organization = typeof organization.$inferSelect
export type NewOrganization = typeof organization.$inferInsert
export type OrganizationId = Organization["id"]
export type OrganizationPublicId = Organization["publicId"]

export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert
export type AccountRole = Account["role"]

export type OrganizationInvitation = typeof organizationInvitation.$inferSelect
export type NewOrganizationInvitation =
  typeof organizationInvitation.$inferInsert

export async function createOrganization(
  values: NewOrganization = {
    name: "Personal Workspace",
  },
  options?: { ownerId?: UserId }
): Promise<Organization> {
  const [newOrganization] = await db
    .insert(organization)
    .values(values)
    .returning()

  invariantReturning(newOrganization, "Failed to create organization")

  if (options?.ownerId) {
    await createAccount(options.ownerId, newOrganization.id, "owner")
  }

  return newOrganization
}

export async function findOrganizationById(
  organizationId: OrganizationId
): Promise<Organization | null> {
  const existingOrganization = await db.query.organization.findFirst({
    where: (model, { eq }) => eq(model.id, organizationId),
  })

  return existingOrganization ?? null
}

export async function findAccountsByUserId(userId: UserId): Promise<Account[]> {
  return db.query.account.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
  })
}

export async function findOrganizationAccount(
  organizationId: OrganizationId,
  userId: UserId
): Promise<Account | null> {
  const existingAccount = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
  })

  return existingAccount ?? null
}

export async function createAccount(
  userId: UserId,
  organizationId: OrganizationId,
  role: Account["role"]
): Promise<Account> {
  const [existingAccount] = await db
    .insert(account)
    .values({ userId, organizationId, role })
    .returning()

  invariantReturning(existingAccount, "Failed to create account")

  return existingAccount
}

export async function deleteAccount(
  organizationId: OrganizationId,
  userId: UserId
): Promise<void> {
  const membership = await findOrganizationAccount(organizationId, userId)

  if (!membership) {
    throw new OrganizationError("User is not a member of the organization")
  }

  if (membership.role === "owner") {
    throw new OrganizationError("User is the owner of the organization")
  }

  await db
    .delete(account)
    .where(
      filters.and(
        filters.eq(account.userId, userId),
        filters.eq(account.organizationId, organizationId)
      )
    )
}

export async function assertUserIsOrganizationMember(
  organizationId: OrganizationId,
  userId: UserId
): Promise<void> {
  const existingAccount = await findOrganizationAccount(organizationId, userId)

  if (!existingAccount) {
    throw new OrganizationError("User is not a member of the organization")
  }
}

export async function createOrganizationInvitation(
  organizationId: OrganizationId,
  inviterId: UserId,
  payload: {
    email: string
    role: OrganizationInvitation["role"]
  }
): Promise<OrganizationInvitation> {
  // Check if the user is already a member of the organization
  const existingAccount = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(
        eq(model.organizationId, organizationId),
        eq(
          model.userId,
          db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, payload.email))
            .limit(1)
        )
      ),
  })

  if (existingAccount) {
    throw new OrganizationError("User is already a member of the organization")
  }

  // Check if the user has already been invited
  const existingInvitation = await db.query.organizationInvitation.findFirst({
    where: (inv, { eq, and, gt }) =>
      and(
        eq(inv.organizationId, organizationId),
        eq(inv.email, payload.email),
        gt(inv.expiresAt, new Date())
      ),
  })

  if (existingInvitation) {
    throw new OrganizationError("User has already been invited")
  }

  const token = await generateRandomString(32, alphabet("a-z", "A-Z", "0-9"))
  const expiresAt = createDate(new TimeSpan(7, "d"))

  const [invitation] = await db
    .insert(organizationInvitation)
    .values({
      organizationId,
      email: payload.email,
      role: payload.role,
      inviterId,
      token,
      expiresAt,
    })
    .returning()

  invariantReturning(invitation, "Failed to create organization invitation")

  await sendOrganizationInvitationEmail(invitation)

  return invitation
}

async function sendOrganizationInvitationEmail(
  invitation: OrganizationInvitation
): Promise<void> {
  const organizationId = invitation.organizationId as OrganizationId
  const organization = await findOrganizationById(organizationId)

  if (!organization) {
    throw new NotFoundError("organization", organizationId.toString())
  }

  await sendEmail(
    invitation.email,
    `You've been invited to join the ${organization.name} organization`,
    OrganizationInvitationEmail({
      organizationName: organization.name,
      invitationToken: invitation.token,
    })
  )
}

export async function findOrganizationInvitationByToken(
  token: string
): Promise<OrganizationInvitation | null> {
  const existingInvitation = await db.query.organizationInvitation.findFirst({
    where: (inv, { eq, and, gt }) =>
      and(eq(inv.token, token), gt(inv.expiresAt, new Date())),
  })

  return existingInvitation ?? null
}

export async function acceptOrganizationInvitation(
  token: string,
  userId: UserId
): Promise<OrganizationInvitation> {
  const invitation = await findOrganizationInvitationByToken(token)

  if (!invitation) {
    throw new OrganizationInvitationError("Invalid or expired invitation")
  }

  await db.transaction(async (tx) => {
    await tx.insert(account).values({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
    })

    await tx
      .delete(organizationInvitation)
      .where(filters.eq(organizationInvitation.id, invitation.id))
  })

  return invitation
}

export async function deleteOrganizationInvitation(
  id: OrganizationInvitation["id"]
): Promise<void> {
  await db
    .delete(organizationInvitation)
    .where(filters.eq(organizationInvitation.id, id))
}

export async function cleanExpiredOrganizationInvitations(): Promise<void> {
  await db
    .delete(organizationInvitation)
    .where(filters.lt(organizationInvitation.expiresAt, new Date()))
}
