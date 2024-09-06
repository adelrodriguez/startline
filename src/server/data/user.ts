import "server-only"

import db, {
  type User,
  type UserId,
  filters,
  type organization,
  type profile,
  user,
} from "@/server/db"
import type { StrictOmit } from "@/utils/type"
import {
  deleteEmailVerificationCode,
  sendEmailVerificationCode,
} from "./email-verification-code"
import { createOrganization } from "./organization"
import { createProfile } from "./profile"

export function createUserId(id: User["id"]) {
  return id as UserId
}

export async function findUserByEmail(email: User["email"]) {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.email, email),
  })

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

export async function findUserById(userId: UserId) {
  const user = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
  })

  return user ?? null
}

export async function createUser(
  values: StrictOmit<typeof user.$inferInsert, "id" | "role">,
  options?: {
    profile?: StrictOmit<typeof profile.$inferInsert, "userId">
    organization?: StrictOmit<typeof organization.$inferInsert, "id"> | true
  },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user" })
    .returning()
    .get()

  const userId = createUserId(newUser.id)

  if (options?.profile) {
    await createProfile(userId, options.profile)
  }

  if (options?.organization) {
    await createOrganization(
      typeof options.organization !== "boolean"
        ? options.organization
        : undefined,
      { ownerId: userId },
    )
  }

  await sendEmailVerificationCode(userId, newUser.email)

  return newUser
}

export async function createAdmin(
  values: StrictOmit<typeof user.$inferInsert, "id" | "role">,
  options?: {
    profile?: StrictOmit<typeof profile.$inferInsert, "userId">
    organization?: StrictOmit<typeof organization.$inferInsert, "id"> | true
  },
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "admin" })
    .returning()
    .get()

  const userId = createUserId(newUser.id)

  if (options?.profile) {
    await createProfile(userId, options.profile)
  }

  if (options?.organization) {
    await createOrganization(
      typeof options.organization !== "boolean"
        ? options.organization
        : undefined,
      { ownerId: userId },
    )
  }

  return newUser
}

export async function findOrCreateUserFromCode(
  values: Pick<typeof user.$inferInsert, "email">,
  options?: {
    profile?: StrictOmit<typeof profile.$inferInsert, "userId">
    organization?: StrictOmit<typeof organization.$inferInsert, "id"> | true
  },
) {
  const existingUser = await findUserByEmail(values.email)

  if (existingUser) {
    const userId = createUserId(existingUser.id)

    if (!existingUser.emailVerifiedAt) {
      await markUserAsEmailVerified(userId)
    }

    await deleteEmailVerificationCode(userId)

    return existingUser
  }

  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .returning()
    .get()

  const userId = createUserId(newUser.id)

  if (options?.profile) {
    await createProfile(userId, options.profile)
  }

  if (options?.organization) {
    await createOrganization(
      typeof options.organization !== "boolean"
        ? options.organization
        : undefined,
      { ownerId: userId },
    )
  }

  await deleteEmailVerificationCode(userId)

  return newUser
}

export async function createUserFromGoogle(
  values: Pick<
    typeof user.$inferInsert,
    "email" | "googleId" | "emailVerifiedAt"
  >,
  options?: {
    profile?: StrictOmit<typeof profile.$inferInsert, "userId">
    organization?: StrictOmit<typeof organization.$inferInsert, "id"> | true
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

  const userId = createUserId(newUser.id)

  if (options?.profile) {
    await createProfile(userId, options.profile)
  }

  if (options?.organization) {
    await createOrganization(
      typeof options.organization !== "boolean"
        ? options.organization
        : undefined,
      { ownerId: userId },
    )
  }

  await deleteEmailVerificationCode(userId)

  return newUser
}

export async function createUserFromGitHub(
  values: Pick<typeof user.$inferInsert, "email" | "githubId">,
  options?: {
    profile?: StrictOmit<typeof profile.$inferInsert, "userId">
    organization?: StrictOmit<typeof organization.$inferInsert, "id"> | true
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

  const userId = createUserId(newUser.id)

  if (options?.profile) {
    await createProfile(userId, options.profile)
  }

  if (options?.organization) {
    await createOrganization(
      typeof options.organization !== "boolean"
        ? options.organization
        : undefined,
      { ownerId: userId },
    )
  }

  await deleteEmailVerificationCode(userId)

  return newUser
}

export function markUserAsEmailVerified(userId: UserId) {
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
