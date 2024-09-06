import "server-only"

import { TimeSpan, createDate } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import { EmailVerificationCodeEmail } from "~/components/emails"
import { sendEmail } from "~/lib/emails"
import db, { type UserId, emailVerificationCode, filters } from "~/server/db"
import { hash, verify } from "~/utils/hash"
import { markUserAsEmailVerified } from "./user"

export async function findValidEmailVerificationCodeByUserId(userId: UserId) {
  const code = await db.query.emailVerificationCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, userId), gte(model.expiresAt, new Date())),
  })

  return code ?? null
}

export async function createEmailVerificationCode(
  userId: UserId,
  input: string,
) {
  const hashedCode = await hash(input)

  return db
    .insert(emailVerificationCode)
    .values({
      hash: hashedCode,
      userId,
      expiresAt: createDate(new TimeSpan(24, "h")),
    })
    .returning()
}

export async function sendEmailVerificationCode(userId: UserId, email: string) {
  // Delete old codes
  await deleteEmailVerificationCode(userId)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await createEmailVerificationCode(userId, code)

  await sendEmail(
    email,
    "Verify your email",
    EmailVerificationCodeEmail({ code }),
  )
}

export async function verifyEmailVerificationCode(
  userId: UserId,
  code: string,
) {
  const emailVerificationCode =
    await findValidEmailVerificationCodeByUserId(userId)

  if (!emailVerificationCode) return false

  const isValidCode = await verify(emailVerificationCode.hash, code)

  if (!isValidCode) return false

  await db.batch([
    deleteEmailVerificationCode(userId),
    markUserAsEmailVerified(userId),
  ])

  return true
}

export function deleteEmailVerificationCode(userId: UserId) {
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
