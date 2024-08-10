"server-only"

import {
  type User,
  deleteEmailVerificationCode,
  insertUser,
  selectUser,
  upsertUser,
  type user,
} from "@/server/db"
import { encode } from "@/utils/obfuscator"
import { sendEmailVerificationCode } from "./email-verification-code"
import { createOrganization } from "./organization"

export async function findUserByEmail(email: User["email"]) {
  const user = await selectUser({ email })

  return user ?? null
}

export async function findUserByGoogleId(googleId: string) {
  const user = await selectUser({ googleId })

  return user ?? null
}

export async function findUserByGitHubId(githubId: string) {
  const user = await selectUser({ githubId })

  return user ?? null
}

export async function findUserById(userId: User["id"]) {
  const user = await selectUser(userId)

  return user ?? null
}

export async function createUser(
  values: Omit<typeof user.$inferInsert, "id" | "role">,
) {
  const user = await insertUser({ ...values, role: "user" })

  await createOrganization(
    {
      name: "My Organization",
      slug: encode(user.id),
    },
    { ownerId: user.id },
  )

  await sendEmailVerificationCode(user)

  return user
}

export async function createAdmin(
  values: Omit<typeof user.$inferInsert, "id" | "role">,
) {
  const user = await insertUser({
    ...values,
    role: "admin",
    emailVerifiedAt: new Date(),
  })

  await createOrganization(
    {
      name: "My Organization",
      slug: encode(user.id),
    },
    { ownerId: user.id },
  )

  return user
}

export async function createUserFromCode(
  values: Pick<typeof user.$inferInsert, "email">,
) {
  const user = await upsertUser({
    ...values,
    role: "user",
    emailVerifiedAt: new Date(),
  })

  await createOrganization(
    {
      name: "My Organization",
      slug: encode(user.id),
    },
    { ownerId: user.id },
  )

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export async function createUserFromGoogle(
  values: Pick<
    typeof user.$inferInsert,
    "email" | "googleId" | "emailVerifiedAt"
  >,
) {
  const user = await upsertUser({
    googleId: values.googleId,
    email: values.email,
    emailVerifiedAt: values.emailVerifiedAt,
  })

  await createOrganization(
    {
      name: "My Organization",
      slug: encode(user.id),
    },
    { ownerId: user.id },
  )

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export async function createUserFromGitHub(
  values: Pick<typeof user.$inferInsert, "email" | "githubId">,
) {
  const user = await upsertUser({
    githubId: values.githubId,
    email: values.email,
    emailVerifiedAt: new Date(),
  })

  await createOrganization(
    {
      name: "My Organization",
      slug: encode(user.id),
    },
    { ownerId: user.id },
  )

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export function checkIsAdmin(user: User) {
  return user.role === "admin"
}

export function checkIsUser(user: User) {
  return user.role === "user"
}
