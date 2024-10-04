import "server-only"

import { generateIdFromEntropySize } from "lucia"
import { TimeSpan, createDate } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import { z } from "zod"

import {
  EmailVerificationCodeEmail,
  PasswordResetTokenEmail,
  SignInCodeEmail,
} from "~/components/emails"
import { sendEmail } from "~/lib/emails"
import { logActivity } from "~/lib/logger"
import db, {
  emailVerificationCode,
  filters,
  password,
  passwordResetToken,
  profile,
  signInCode,
  user,
  type session,
} from "~/server/db"
import { argon2, sha } from "~/utils/hash"
import type { StrictOmit } from "~/utils/type"

export type User = typeof user.$inferSelect
export type UserRole = User["role"]
export type NewUser = typeof user.$inferInsert

export const UserId = z.number().brand<"UserId">()
export type UserId = z.infer<typeof UserId>

export type Profile = typeof profile.$inferSelect
export type NewProfile = typeof profile.$inferInsert

export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert

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

export function createUser(values: StrictOmit<NewUser, "id" | "role">) {
  return db
    .insert(user)
    .values({ ...values, role: "user" })
    .returning()
    .get()
}

export async function createUserFromGoogle(
  values: Pick<NewUser, "email" | "googleId" | "emailVerifiedAt">,
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { emailVerifiedAt: new Date(), googleId: values.googleId },
    })
    .returning()
    .get()

  await logActivity("signed_up_with_google", {
    userId: UserId.parse(newUser.id),
  })

  return newUser
}

export async function createUserFromGitHub(
  values: Pick<NewUser, "email" | "githubId">,
) {
  const newUser = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { emailVerifiedAt: new Date(), githubId: values.githubId },
    })
    .returning()
    .get()

  await logActivity("signed_up_with_github", {
    userId: UserId.parse(newUser.id),
  })

  return newUser
}

export function findOrCreateUser(values: Pick<NewUser, "email">) {
  return db
    .insert(user)
    .values({ ...values, role: "user" })
    .onConflictDoNothing()
    .returning()
    .get()
}

export async function markUserAsEmailVerified(userId: UserId) {
  await db
    .update(user)
    .set({ emailVerifiedAt: new Date() })
    .where(
      filters.and(
        filters.eq(user.id, userId),
        filters.isNull(user.emailVerifiedAt),
      ),
    )
    .returning()

  await logActivity("marked_email_as_verified", { userId })
}

export function checkIsAdmin(user: User) {
  return user.role === "admin"
}

export function checkIsUser(user: User) {
  return user.role === "user"
}

export async function createProfile(
  userId: UserId,
  values: StrictOmit<NewProfile, "userId"> = {},
) {
  return db
    .insert(profile)
    .values({ ...values, userId })
    .onConflictDoNothing()
    .returning()
    .get()
}

export async function findValidEmailVerificationCodeByUserId(userId: UserId) {
  const code = await db.query.emailVerificationCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, userId), gte(model.expiresAt, new Date())),
  })

  return code ?? null
}

export async function sendEmailVerificationCode(userId: UserId, email: string) {
  // Delete old codes
  await deleteEmailVerificationCodes(userId)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await db
    .insert(emailVerificationCode)
    .values({
      hash: await sha.sha256.hash(code),
      userId,
      expiresAt: createDate(new TimeSpan(24, "h")),
    })
    .returning()

  await sendEmail(
    email,
    "Verify your email",
    EmailVerificationCodeEmail({ code }),
  )

  await logActivity("requested_email_verification", { userId })
}

export async function verifyEmailVerificationCode(
  userId: UserId,
  code: string,
) {
  const emailVerificationCode =
    await findValidEmailVerificationCodeByUserId(userId)

  if (!emailVerificationCode) return false

  const isValidCode = await sha.sha256.verify(emailVerificationCode.hash, code)

  if (!isValidCode) return false

  await deleteEmailVerificationCodes(userId)
  await markUserAsEmailVerified(userId)

  return true
}

export function deleteEmailVerificationCodes(userId: UserId) {
  return db
    .delete(emailVerificationCode)
    .where(filters.eq(emailVerificationCode.userId, userId))
    .returning()
}

export async function cleanExpiredEmailVerificationCodes() {
  const result = await db
    .delete(emailVerificationCode)
    .where(filters.lt(emailVerificationCode.expiresAt, new Date()))

  return result.rowsAffected
}

export async function findValidPasswordResetToken(input: string) {
  const hashed = await sha.sha256.hash(input)

  const token = await db.query.passwordResetToken.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.hash, hashed), gte(model.expiresAt, new Date())),
  })

  return token ?? null
}

export async function sendPasswordResetToken(userId: UserId, email: string) {
  await deletePasswordResetTokens(userId)

  const token = generateIdFromEntropySize(25)

  await db.insert(passwordResetToken).values({
    userId,
    hash: await sha.sha256.hash(token),
    expiresAt: createDate(new TimeSpan(24, "h")),
  })

  await sendEmail(
    email,
    "Reset your password",
    PasswordResetTokenEmail({ token }),
  )

  await logActivity("requested_password_reset", { userId })
}

export async function markPasswordResetTokenAsUsed(userId: UserId) {
  await deletePasswordResetTokens(userId)

  await logActivity("reset_password", { userId })

  // If the user received received the password reset token and it was verified,
  // we can mark the user as verified.
  await markUserAsEmailVerified(userId)
}

export function deletePasswordResetTokens(userId: UserId) {
  return db
    .delete(passwordResetToken)
    .where(filters.eq(passwordResetToken.userId, userId))
    .returning()
}

export async function cleanExpiredPasswordResetTokens() {
  const result = await db
    .delete(passwordResetToken)
    .where(filters.lt(passwordResetToken.expiresAt, new Date()))

  return result.rowsAffected
}

export async function createPassword(userId: UserId, input: string) {
  const hashedPassword = await argon2.hash(input)

  return db
    .insert(password)
    .values({ hash: hashedPassword, userId })
    .onConflictDoUpdate({
      target: password.userId,
      set: { hash: hashedPassword },
    })
    .returning()
    .get()
}

export async function findPassword(userId: UserId) {
  const password = await db.query.password.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })

  return password ?? null
}

export async function verifyPassword(userId: UserId, input: string) {
  const password = await findPassword(userId)

  if (!password) {
    return false
  }

  return argon2.verify(password.hash, input)
}

export async function sendSignInCode(email: string) {
  // Delete old codes
  await deleteSignInCode(email)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await db.insert(signInCode).values({
    email,
    hash: await sha.sha256.hash(code),
    expiresAt: createDate(new TimeSpan(15, "m")),
  })

  await sendEmail(email, "Sign in code", SignInCodeEmail({ code }))

  await logActivity("requested_sign_in_code")
}

export async function verifySignInCode(email: string, code: string) {
  const signInCode = await db.query.signInCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.email, email), gte(model.expiresAt, new Date())),
  })

  if (!signInCode) return false

  const isValidCode = await sha.sha256.verify(signInCode.hash, code)

  if (!isValidCode) return false

  // Delete the verified code
  await deleteSignInCode(email)

  return true
}

export function deleteSignInCode(email: string) {
  return db
    .delete(signInCode)
    .where(filters.eq(signInCode.email, email))
    .returning()
}

export async function cleanExpiredSignInCodes() {
  const result = await db
    .delete(signInCode)
    .where(filters.lt(signInCode.expiresAt, new Date()))

  return result.rowsAffected
}
