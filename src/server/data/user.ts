"server-only"

import db, { type User, filters, type profile, user } from "@/server/db"
import type { OmitUserId } from "@/utils/type"
import {
  deleteEmailVerificationCode,
  sendEmailVerificationCode,
} from "./email-verification-code"
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
  options?: { profile?: OmitUserId<typeof profile.$inferInsert> },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user" })
    .returning()
    .get()

  if (options?.profile) {
    await createProfile(newUser.id, options.profile)
  }

  await sendEmailVerificationCode(newUser)

  return newUser
}

export async function createAdmin(
  values: Omit<typeof user.$inferInsert, "id" | "role">,
  options?: { profile?: OmitUserId<typeof profile.$inferInsert> },
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

export async function createUserFromCode(
  values: Pick<typeof user.$inferInsert, "email">,
  options?: { profile?: OmitUserId<typeof profile.$inferInsert> },
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

  await deleteEmailVerificationCode(newUser.id)

  return newUser
}

export async function createUserFromGoogle(
  values: Pick<
    typeof user.$inferInsert,
    "email" | "googleId" | "emailVerifiedAt"
  >,
  options?: { profile?: OmitUserId<typeof profile.$inferInsert> },
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

  await deleteEmailVerificationCode(newUser.id)

  return newUser
}

export async function createUserFromGitHub(
  values: Pick<typeof user.$inferInsert, "email" | "githubId">,
  options?: { profile?: OmitUserId<typeof profile.$inferInsert> },
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
