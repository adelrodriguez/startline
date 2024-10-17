import "server-only"

import { alphabet, generateRandomString } from "oslo/crypto"
} from "~/server/db"
export const OrganizationId = z.bigint().brand<"OrganizationId">()
export type OrganizationId = z.infer<typeof OrganizationId>

export type Acc
export type type OrganizationInvitation = typeof organizationInvitation.$inferSelect
export type =
  typeof orgtype anizationInvitation.$inferInsert(
  values: NewOrganization = {
    name: "Pers
  const [newtype Organization] = await db
    .insert(
    .values(type values)
  if (!newOrganization) {
    throw new Daa
  if (option
    await crtype eateAccount(
      option
      Organitype zationId.parse(newOrganization.i
  }

  await logAated_organization", {
    userId: type nerId,
    organizationId: OrganizationId.parse(newOrganization.id),
  })

  return newtype Organization
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
  const [existingAccount] = await db
    .insert(account)
    .values({ userId, organizationId, role })
    .returning()

  if (!existingAccount) throw new DatabaseError("Failed to create account")

  return existingAccount
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

  if (!existingAccount || existingAccount.role !== "owner") {
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
  inviterId: UserId,
  payload: {
    email: string
    role: OrganizationInvitation["role"]
  },
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
        eq(inv.email, payload.email),
        gt(inv.expiresAt, new Date()),
      ),
  })

  if (existingInvitation) {
    throw new OrganizationError("User has already been invited")
  }

  const token = await generateRandomString(32, alphabet("a-z", "A-Z", "0-9"))
  const expiresAt = addDays(new Date(), 7)

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

  if (!invitation) {
    throw new DatabaseError("Failed to create organization invitation")
  }

  await sendOrganizationInvitationEmail(invitation)

  await logActivity("invited_member_to_organization", {
    userId: inviterId,
    organizationId,
  })

  return invitation
}

async function sendOrganizationInvitationEmail(
  invitation: OrganizationInvitation,
): Promise<void> {
  const organizationId = OrganizationId.parse(invitation.organizationId)
  const organization = await findOrganizationById(organizationId)

  if (!organization) {
    throw new NotFoundError("organization", organizationId.toString())
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
): Promise<OrganizationInvitation | null> {
  const existingInvitation = await db.query.organizationInvitation.findFirst({
    where: (inv, { eq, and, gt }) =>
      and(eq(inv.token, token), gt(inv.expiresAt, new Date())),
  })

  return existingInvitation ?? null
}

export async function acceptOrganizationInvitation(
  token: string,
  userId: UserId,
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
  id: OrganizationInvitation["id"],
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
