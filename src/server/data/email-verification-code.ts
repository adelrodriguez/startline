"server-only"

import { EmailVerificationCodeEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import db, { type User, emailVerificationCode, filters } from "@/server/db"
import { hash, verify } from "@/utils/hash"
import { alphabet, generateRandomString } from "oslo/crypto"
import { markUserAsEmailVerified } from "./user"

export async function findValidEmailVerificationCode(userId: User["id"]) {
  const code = await db.query.emailVerificationCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, userId), gte(model.expiresAt, new Date())),
  })

  return code ?? null
}

export async function createEmailVerificationCode(
  userId: User["id"],
  input: string,
) {
  const hashedCode = await hash(input)

  return db
    .insert(emailVerificationCode)
    .values({ hash: hashedCode, userId, expiresAt: new Date() })
    .returning()
}

export async function sendEmailVerificationCode(user: User) {
  // Delete old codes
  await deleteEmailVerificationCode(user.id)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await createEmailVerificationCode(user.id, code)

  await sendEmail(
    user.email,
    "Verify email",
    EmailVerificationCodeEmail({ code }),
  )
}

export async function verifyEmailVerificationCode(
  userId: User["id"],
  code: string,
) {
  const emailVerificationCode = await findValidEmailVerificationCode(userId)

  if (!emailVerificationCode) return false

  const isValidCode = await verify(emailVerificationCode.hash, code)

  if (!isValidCode) return false

  await db.batch([
    deleteEmailVerificationCode(userId),
    markUserAsEmailVerified(userId),
  ])

  return true
}

export function deleteEmailVerificationCode(userId: User["id"]) {
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
