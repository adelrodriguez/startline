"server-only"

import {
  type User,
  type UserValues,
  deleteEmailVerificationCode,
  insertUser,
  selectUser,
  upsertUser,
} from "@/server/db"
import { sendEmailVerificationCode } from "./email-verification-code"

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

export async function createUser(values: Omit<UserValues, "id" | "role">) {
  const user = await insertUser({ ...values, role: "user" })

  await sendEmailVerificationCode(user)

  return user
}

export async function createAdmin(values: Omit<UserValues, "id" | "role">) {
  const user = await insertUser({ ...values, role: "admin" })

  return user
}

export async function createUserFromCode(values: Pick<UserValues, "email">) {
  const user = await upsertUser({
    ...values,
    role: "user",
    emailVerifiedAt: new Date(),
  })

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export async function createUserFromGoogle(
  values: Pick<UserValues, "email" | "googleId" | "emailVerifiedAt">,
) {
  const user = await upsertUser({
    googleId: values.googleId,
    email: values.email,
    emailVerifiedAt: values.emailVerifiedAt,
  })

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export async function createUserFromGitHub(
  values: Pick<UserValues, "email" | "githubId">,
) {
  const user = await upsertUser({
    githubId: values.githubId,
    email: values.email,
    emailVerifiedAt: new Date(),
  })

  await deleteEmailVerificationCode({ userId: user.id })

  return user
}

export function checkIsAdmin(user: User) {
  return user.role === "admin"
}

export function checkIsUser(user: User) {
  return user.role === "user"
}
