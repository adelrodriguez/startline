import "server-only"

import db, {
  type User,
  filters,
  type organization,
  type profile,
  user,
} from "@/server/db"
import {
  deleteEmailVerificationCode,
  sendEmailVerificationCode,
} from "./email-verification-code"
import { createOrganization } from "./organization"
import { createProfile } from "./profile"

export async function findUserByEmail(email: User["email"]) {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.email, email),
  })

  db

  return existingUser ?? null
}

export async function findUserByGoogleId(googleId: string) {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.googleId, googleId),
  })

  return existingUser ?? null
}

export async function findUserByGitHubId(githubId: string) {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.githubId, githubId),
  })

  return existingUser ?? null
}

export async function findUserById(userId: User["id"]) {
  const user = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
  })

  return user ?? null
}

export async function createUser(
  values: Omit<typeof user.$inferInsert, "id" | "role">,
  options?: {
    profile?: Omit<typeof profile.$inferInsert, "id" | "userId">
    organization?: Omit<typeof organization.$inferInsert, "id">
  },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user" })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  if (options?.organization) {
    await createOrganization(options.organization, { ownerId: newUser.id })
  }

  await sendEmailVerificationCode(newUser)

  return newUser
}

export async function createAdmin(
  values: Omit<typeof user.$inferInsert, "id" | "role">,
  options?: { profile?: Omit<typeof profile.$inferInsert, "id" | "userId"> },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "admin" })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  return newUser
}

export async function findOrCreateUserFromCode(
  values: Pick<typeof user.$inferInsert, "email">,
  options?: {
    profile?: Omit<typeof profile.$inferInsert, "id" | "userId">
    organization?: Omit<typeof organization.$inferInsert, "id">
  },
) {
  const existingUser = await findUserByEmail(values.email)

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      await markUserAsEmailVerified(existingUser.id)
    }

    await deleteEmailVerificationCode(existingUser.id)

    return existingUser
  }

  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  if (options?.organization) {
    await createOrganization(options.organization, { ownerId: newUser.id })
  }

  await deleteEmailVerificationCode(newUser.id)

  return newUser
}

export async function createUserFromGoogle(
  values: Pick<
    typeof user.$inferInsert,
    "email" | "googleId" | "emailVerifiedAt"
  >,
  options?: {
    profile?: Omit<typeof profile.$inferInsert, "id" | "userId">
    organization?: Omit<typeof organization.$inferInsert, "id">
  },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { googleId: values.googleId, emailVerifiedAt: new Date() },
    })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  if (options?.organization) {
    await createOrganization(options.organization, { ownerId: newUser.id })
  }

  await deleteEmailVerificationCode(newUser.id)

  return newUser
}

export async function createUserFromGitHub(
  values: Pick<typeof user.$inferInsert, "email" | "githubId">,
  options?: {
    profile?: Omit<typeof profile.$inferInsert, "id" | "userId">
    organization?: Omit<typeof organization.$inferInsert, "id">
  },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { emailVerifiedAt: new Date() },
    })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  if (options?.organization) {
    await createOrganization(options.organization, { ownerId: newUser.id })
  }

  await deleteEmailVerificationCode(newUser.id)

  return newUser
}

export function markUserAsEmailVerified(userId: User["id"]) {
  return db
    .update(user)
    .set({ emailVerifiedAt: new Date() })
    .where(filters.eq(user.id, userId))
    .returning()
}

export function checkIsAdmin(user: User) {
  return user.role === "admin"
}

export function checkIsUser(user: User) {
  return user.role === "user"
}
