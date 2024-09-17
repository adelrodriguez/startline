import "server-only"

import { TimeSpan, createDate } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import { OrganizationInvitationEmail } from "~/components/emails"
import { sendEmail } from "~/lib/emails"
import db, {
  account,
  filters,
  organization,
  organizationInvitation,
  user,
} from "~/server/db"
import { OrganizationError } from "~/utils/error"
import type { StrictOmit } from "~/utils/type"
import { z } from "zod"
import type { UserId } from "./user"

export type Organization = typeof organization.$inferSelect
export type NewOrganization = typeof organization.$inferInsert

export const OrganizationId = z.number().brand<"OrganizationId">()
export type OrganizationId = z.infer<typeof OrganizationId>

export type Account = typeof account.$inferSelect
export type AccountRole = Account["role"]
export type NewAccount = typeof account.$inferInsert

export type OrganizationInvitation = typeof organizationInvitation.$inferSelect
export type NewOrganizationInvitation =
  typeof organizationInvitation.$inferInsert

export async function createOrganization(
  values: StrictOmit<NewOrganization, "id"> = {
    name: "Personal Workspace",
  },
  options?: { ownerId?: UserId },
): Promise<Organization> {
  const newOrganization = await db
    .insert(organization)
    .values(values)
    .returning()
    .get()

  if (options?.ownerId) {
    await createAccount(
      options.ownerId,
      OrganizationId.parse(newOrganization.id),
      "owner",
    )
  }

  return newOrganization
}

export async function findOrganizationById(
  organizationId: OrganizationId,
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

export async function createAccount(
  userId: UserId,
  organizationId: OrganizationId,
  role: Account["role"],
): Promise<Account> {
  return db
    .insert(account)
    .values({ userId, organizationId, role })
    .returning()
    .get()
}

export async function removeMemberFromOrganization(
  organizationId: OrganizationId,
  userId: UserId,
): Promise<void> {
  const membership = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
    columns: {
      role: true,
    },
  })

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
        filters.eq(account.organizationId, organizationId),
      ),
    )
}

export async function assertIsOrganizationOwner(
  organizationId: OrganizationId,
  userId: UserId,
): Promise<void> {
  const existingAccount = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
    columns: {
      role: true,
    },
  })

  if (!existingAccount) {
    throw new OrganizationError("User is not a member of the organization")
  }

  if (existingAccount.role !== "owner") {
    throw new OrganizationError("User is not an owner of the organization")
  }
}

export async function assertIsOrganizationMember(
  organizationId: OrganizationId,
  userId: UserId,
): Promise<void> {
  const existingAccount = await db.query.account.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.organizationId, organizationId), eq(model.userId, userId)),
  })

  if (!existingAccount) {
    throw new OrganizationError("User is not a member of the organization")
  }
}

export async function createOrganizationInvitation(
  organizationId: OrganizationId,
  email: string,
  role: OrganizationInvitation["role"],
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
            .where(eq(user.email, email))
            .limit(1),
        ),
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
        eq(inv.email, email),
        gt(inv.expiresAt, new Date()),
      ),
  })

  if (existingInvitation) {
    throw new OrganizationError("User has already been invited")
  }

  const token = await generateRandomString(32, alphabet("a-z", "A-Z", "0-9"))
  const expiresAt = createDate(new TimeSpan(7, "d"))

  const invitation = await db
    .insert(organizationInvitation)
    .values({
      organizationId,
      email,
      role,
      token,
      expiresAt,
    })
    .returning()
    .get()

  await sendOrganizationInvitationEmail(invitation)

  return invitation
}

async function sendOrganizationInvitationEmail(
  invitation: OrganizationInvitation,
): Promise<void> {
  const organization = await findOrganizationById(
    OrganizationId.parse(invitation.organizationId),
  )

  if (!organization) {
    throw new OrganizationError("Organization not found")
  }

  await sendEmail(
    invitation.email,
    "Organization Invitation",
    OrganizationInvitationEmail({
      organizationName: organization.name,
      invitationToken: invitation.token,
    }),
  )
}

export async function findOrganizationInvitationByToken(
  token: string,
): Promise<OrganizationInvitation | undefined> {
  const existingInvitation = await db.query.organizationInvitation.findFirst({
    where: (inv, { eq, and, gt }) =>
      and(eq(inv.token, token), gt(inv.expiresAt, new Date())),
  })

  return existingInvitation ?? undefined
}

export async function acceptOrganizationInvitation(
  token: string,
  userId: UserId,
): Promise<OrganizationInvitation> {
  const invitation = await findOrganizationInvitationByToken(token)

  if (!invitation) {
    throw new OrganizationError("Invalid or expired invitation")
  }

  await db.batch([
    db.insert(account).values({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
    }),
    deleteOrganizationInvitation(invitation.id),
  ])

  return invitation
}

export function deleteOrganizationInvitation(id: OrganizationInvitation["id"]) {
  return db
    .delete(organizationInvitation)
    .where(filters.eq(organizationInvitation.id, id))
}

export async function cleanExpiredOrganizationInvitations(): Promise<number> {
  const result = await db
    .delete(organizationInvitation)
    .where(filters.lt(organizationInvitation.expiresAt, new Date()))

  return result.rowsAffected
}
